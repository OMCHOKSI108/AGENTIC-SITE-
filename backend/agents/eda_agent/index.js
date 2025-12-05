const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class EDAAgent {
  async run(input) {
    try {
      const { csv_upload } = input;

      if (!csv_upload) {
        throw new Error('CSV file path is required');
      }

      // Read and parse CSV (handle both file path and CSV content)
      let data;
      if (fs.existsSync(csv_upload)) {
        // It's a file path
        data = await this.parseCSV(csv_upload);
      } else {
        // It's CSV content as string
        data = await this.parseCSVContent(csv_upload);
      }

      if (data.length === 0) {
        throw new Error('CSV file is empty or could not be parsed');
      }

      // Perform basic EDA
      const analysis = await this.performEDA(data);

      return {
        success: true,
        analysis: analysis,
        rowCount: data.length,
        columnCount: Object.keys(data[0] || {}).length,
        processed_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('EDA Agent Error:', error);
      return {
        success: false,
        error: error.message,
        analysis: null
      };
    }
  }

  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];

      if (!fs.existsSync(filePath)) {
        reject(new Error('CSV file not found'));
        return;
      }

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  async parseCSVContent(csvContent) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      // Convert CSV string to stream
      const stream = require('stream');
      const readable = new stream.Readable();
      readable.push(csvContent);
      readable.push(null);

      readable
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  async performEDA(data) {
    try {
      // Basic statistical analysis
      const columns = Object.keys(data[0] || {});
      const stats = this.calculateBasicStats(data, columns);

      // Generate insights using Gemini
      const insights = await this.generateInsights(data, stats);

      return {
        basic_stats: stats,
        insights: insights,
        data_preview: data.slice(0, 5), // First 5 rows
        recommendations: this.generateRecommendations(stats)
      };

    } catch (error) {
      throw new Error(`EDA analysis failed: ${error.message}`);
    }
  }

  calculateBasicStats(data, columns) {
    const stats = {};

    columns.forEach(column => {
      const values = data.map(row => {
        const val = row[column];
        if (!val || val === '') return null;

        // Try to convert to number
        const num = parseFloat(val);
        return isNaN(num) ? val : num;
      }).filter(val => val !== null);

      if (values.length === 0) {
        stats[column] = { type: 'empty', count: 0 };
        return;
      }

      const numericValues = values.filter(val => typeof val === 'number');
      const isNumeric = numericValues.length > values.length * 0.8; // 80% numeric

      if (isNumeric && numericValues.length > 0) {
        stats[column] = {
          type: 'numeric',
          count: numericValues.length,
          mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          missing: data.length - numericValues.length
        };
      } else {
        // Categorical data
        const uniqueValues = [...new Set(values)];
        stats[column] = {
          type: 'categorical',
          count: values.length,
          unique: uniqueValues.length,
          most_common: this.getMostCommon(values),
          missing: data.length - values.length
        };
      }
    });

    return stats;
  }

  getMostCommon(arr) {
    const counts = {};
    arr.forEach(val => counts[val] = (counts[val] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  }

  async generateInsights(data, stats) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Analyze this dataset and provide 5 actionable insights. Here are the basic statistics:

${JSON.stringify(stats, null, 2)}

Dataset preview (first 5 rows):
${JSON.stringify(data.slice(0, 5), null, 2)}

Please provide exactly 5 numbered insights that would be valuable for business decision making. Keep each insight to 1-2 sentences.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse insights
      const insights = text.split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);

      return insights;

    } catch (error) {
      console.error('Gemini API error:', error);
      return ['Unable to generate AI insights due to API error'];
    }
  }

  generateRecommendations(stats) {
    const recommendations = [];

    // Check for missing data
    const columnsWithMissing = Object.entries(stats)
      .filter(([col, stat]) => stat.missing > 0)
      .map(([col, stat]) => ({ column: col, missing: stat.missing, total: stat.count + stat.missing }));

    if (columnsWithMissing.length > 0) {
      recommendations.push(`Handle missing data in columns: ${columnsWithMissing.map(c => c.column).join(', ')}`);
    }

    // Check for potential correlations (basic)
    const numericColumns = Object.entries(stats)
      .filter(([col, stat]) => stat.type === 'numeric')
      .map(([col]) => col);

    if (numericColumns.length >= 2) {
      recommendations.push('Consider correlation analysis between numeric variables');
    }

    // General recommendations
    recommendations.push('Create visualizations to better understand data distributions');
    recommendations.push('Consider feature engineering for better model performance');

    return recommendations;
  }
}

module.exports = new EDAAgent();
