const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class PDFExtractorAgent {
  async run(input) {
    try {
      const { pdf_file } = input;

      if (!pdf_file) {
        throw new Error('PDF file path is required');
      }

      // Extract data from PDF
      const extractedData = await this.extractFromPDF(pdf_file);

      return {
        success: true,
        extracted_data: extractedData,
        file_name: path.basename(pdf_file),
        extracted_at: new Date().toISOString(),
        total_pages: extractedData.pages?.length || 0,
        total_sections: extractedData.sections?.length || 0
      };

    } catch (error) {
      console.error('PDF Extractor Error:', error);
      return {
        success: false,
        error: error.message,
        extracted_data: null
      };
    }
  }

  async extractFromPDF(pdfPath) {
    try {
      // For demo purposes, we'll simulate PDF extraction
      // In a real implementation, you'd use pdf-parse or similar library
      let textContent = '';

      if (fs.existsSync(pdfPath)) {
        // Check if it's actually a PDF or text file
        const fileExtension = path.extname(pdfPath).toLowerCase();
        if (fileExtension === '.txt' || fileExtension === '.md') {
          textContent = fs.readFileSync(pdfPath, 'utf8');
        } else {
          // For PDF files, we'd need pdf-parse, but for now return a message
          textContent = `PDF content extraction not implemented. Please provide text content directly or install pdf-parse library. File: ${path.basename(pdfPath)}`;
        }
      } else {
        textContent = pdfPath; // Assume it's text content
      }

      // Process the extracted text into structured JSON
      const structuredData = await this.structureExtractedData(textContent);

      return structuredData;

    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  async structureExtractedData(textContent) {
    try {
      const prompt = `Extract and structure the following document content into a clean JSON format.

DOCUMENT CONTENT:
${textContent}

Please analyze the content and create a structured JSON with the following hierarchy:

1. **metadata**: Basic document information
   - title (main heading or inferred title)
   - author (if mentioned)
   - date (if mentioned)
   - total_pages (estimate)
   - language

2. **sections**: Array of main sections with:
   - title: section heading
   - content: full text of the section
   - subsections: array of subsections (if any)
   - page_number: estimated page location

3. **tables**: Array of extracted tables with:
   - title: table caption or description
   - headers: array of column headers
   - rows: array of data rows
   - page_number: location

4. **key_points**: Array of important bullet points or takeaways

5. **entities**: Named entities found (people, organizations, dates, etc.)

6. **summary**: Brief overview of the entire document

Ensure the JSON is valid and well-structured. If certain sections don't exist, use empty arrays. Focus on accuracy and completeness.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.1,
        max_tokens: 1500,
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) {
        throw new Error('No response from AI model');
      }

      // Parse the JSON response
      const structuredData = this.parseStructuredJSON(result);

      return structuredData;

    } catch (error) {
      throw new Error(`Data structuring failed: ${error.message}`);
    }
  }

  parseStructuredJSON(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                       response.match(/```\s*([\s\S]*?)\s*```/) ||
                       response.match(/\{[\s\S]*\}/);

      let jsonString = '';
      if (jsonMatch) {
        jsonString = jsonMatch[1] || jsonMatch[0];
      } else {
        jsonString = response;
      }

      // Clean up the JSON string
      jsonString = jsonString.trim();

      // Parse the JSON
      const parsedData = JSON.parse(jsonString);

      return parsedData;

    } catch (parseError) {
      // If JSON parsing fails, create a structured fallback
      console.warn('JSON parsing failed, creating fallback structure:', parseError.message);

      return {
        metadata: {
          title: this.extractTitle(response),
          author: null,
          date: null,
          total_pages: 1,
          language: 'en'
        },
        sections: [{
          title: 'Main Content',
          content: response,
          subsections: [],
          page_number: 1
        }],
        tables: [],
        key_points: this.extractKeyPoints(response),
        entities: [],
        summary: response.substring(0, 200) + '...'
      };
    }
  }

  extractTitle(text) {
    // Try to find a title in the first few lines
    const lines = text.split('\n').slice(0, 5);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 10 && trimmed.length < 100 && !trimmed.includes('http')) {
        return trimmed;
      }
    }
    return 'Extracted Document';
  }

  extractKeyPoints(text) {
    const points = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if ((trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed)) &&
          trimmed.length > 10 && trimmed.length < 200) {
        points.push(trimmed.replace(/^[-•\d+.]+\s*/, ''));
      }
    }

    return points.slice(0, 10); // Limit to 10 points
  }
}

module.exports = new PDFExtractorAgent();
