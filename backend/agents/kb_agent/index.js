const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class KnowledgeBaseAgent {
  constructor() {
    this.documents = new Map(); // Simple in-memory storage for demo
    this.embeddings = new Map(); // Would be vector database in production
  }

  async run(input) {
    try {
      const { documents, query } = input;

      if (!query && !documents) {
        throw new Error('Either documents for ingestion or a query is required');
      }

      if (documents) {
        // Handle both single file path and array of file paths
        const documentPaths = Array.isArray(documents) ? documents : [documents];
        // Ingest documents
        const ingestionResult = await this.ingestDocuments(documentPaths);
        return {
          success: true,
          operation: 'ingestion',
          output: ingestionResult,
          processed_at: new Date().toISOString()
        };
      } else if (query) {
        // Answer query
        const answer = await this.answerQuery(query);
        return {
          success: true,
          operation: 'query',
          output: answer,
          processed_at: new Date().toISOString()
        };
      }

    } catch (error) {
      console.error('Knowledge Base Error:', error);
      return {
        success: false,
        error: error.message,
        operation: input.documents ? 'ingestion' : 'query',
        output: null
      };
    }
  }

  async ingestDocuments(documentPaths) {
    const results = [];

    for (const docPath of documentPaths) {
      try {
        let content = '';
        let metadata = {};

        if (typeof docPath === 'string') {
          // File path
          if (fs.existsSync(docPath)) {
            content = fs.readFileSync(docPath, 'utf8');
            metadata = {
              filename: path.basename(docPath),
              path: docPath,
              size: fs.statSync(docPath).size,
              type: this.detectFileType(docPath)
            };
          } else {
            throw new Error(`File not found: ${docPath}`);
          }
        } else if (typeof docPath === 'object') {
          content = docPath.content || '';
          metadata = { ...docPath, type: 'structured' };
        }

        // Split into chunks (simple approach)
        const chunks = this.chunkText(content, 1000);

        // Generate embeddings (mock)
        const docEmbeddings = await this.generateEmbeddings(chunks);

        // Store in memory (would be vector DB in production)
        const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.documents.set(docId, {
          content,
          chunks,
          metadata,
          embeddings: docEmbeddings
        });

        results.push({
          doc_id: docId,
          filename: metadata.filename,
          chunks_count: chunks.length,
          total_tokens: content.split(/\s+/).length,
          status: 'ingested'
        });

      } catch (error) {
        results.push({
          doc_path: docPath,
          status: 'failed',
          error: error.message
        });
      }
    }

    return {
      total_documents: results.length,
      successful_ingestions: results.filter(r => r.status === 'ingested').length,
      documents: results
    };
  }

  async answerQuery(query) {
    try {
      // Find relevant chunks (mock similarity search)
      const relevantChunks = await this.findRelevantChunks(query);

      if (relevantChunks.length === 0) {
        return {
          answer: "I don't have enough information in the knowledge base to answer this question.",
          sources: [],
          confidence: 0
        };
      }

      // Generate answer using Groq
      const context = relevantChunks.map(chunk => chunk.text).join('\n\n');
      const answer = await this.generateAnswer(query, context);

      // Format sources
      const sources = relevantChunks.map(chunk => ({
        doc_id: chunk.docId,
        filename: chunk.metadata.filename,
        chunk_index: chunk.index,
        similarity_score: chunk.score,
        text_preview: chunk.text.substring(0, 200) + '...'
      }));

      return {
        answer: answer,
        sources: sources,
        confidence: this.calculateConfidence(relevantChunks),
        total_sources: sources.length
      };

    } catch (error) {
      throw new Error(`Query processing failed: ${error.message}`);
    }
  }

  chunkText(text, chunkSize = 1000) {
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }

    return chunks;
  }

  async generateEmbeddings(chunks) {
    // Mock embeddings - in production, this would use actual embedding models
    // like OpenAI embeddings, Sentence Transformers, etc.
    return chunks.map(chunk => ({
      vector: Array.from({ length: 384 }, () => Math.random() * 2 - 1), // Mock 384-dim vector
      text: chunk
    }));
  }

  async findRelevantChunks(query, topK = 5) {
    const relevantChunks = [];

    // Mock similarity search - in production, this would use vector similarity
    for (const [docId, doc] of this.documents) {
      for (let i = 0; i < doc.chunks.length; i++) {
        const chunk = doc.chunks[i];
        const score = this.calculateSimilarity(query, chunk);

        if (score > 0.1) { // Mock threshold
          relevantChunks.push({
            docId,
            index: i,
            text: chunk,
            score: score,
            metadata: doc.metadata
          });
        }
      }
    }

    // Sort by score and return top K
    return relevantChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  calculateSimilarity(query, text) {
    // Simple mock similarity - count common words
    const queryWords = query.toLowerCase().split(/\s+/);
    const textWords = text.toLowerCase().split(/\s+/);

    const commonWords = queryWords.filter(word =>
      textWords.some(textWord => textWord.includes(word) || word.includes(textWord))
    );

    return commonWords.length / Math.max(queryWords.length, 1);
  }

  async generateAnswer(query, context) {
    try {
      const prompt = `Answer the following question using only the provided context. If the context doesn't contain enough information to answer the question, say so.

Question: ${query}

Context:
${context}

Provide a clear, concise answer and cite specific parts of the context when relevant.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        max_tokens: 800,
      });

      const result = completion.choices[0]?.message?.content;

      return result || 'Unable to generate answer from the provided context.';

    } catch (error) {
      return 'Error generating answer. Please try again.';
    }
  }

  calculateConfidence(chunks) {
    if (chunks.length === 0) return 0;

    const avgScore = chunks.reduce((sum, chunk) => sum + chunk.score, 0) / chunks.length;
    return Math.min(avgScore * 100, 100); // Convert to percentage
  }

  detectFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.pdf': 'PDF',
      '.docx': 'Word Document',
      '.txt': 'Text File',
      '.md': 'Markdown',
      '.html': 'HTML',
      '.json': 'JSON'
    };
    return types[ext] || 'Unknown';
  }
}

module.exports = new KnowledgeBaseAgent();
