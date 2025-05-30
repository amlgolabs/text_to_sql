import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: In a production environment, you should store this in an environment variable
// and not commit it to your repository
const API_KEY = "AIzaSyAgVRDntTKqy16BqkaM_SfPx7R-GqJcw0M" ; // Replace with your actual API key

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generates SQL from natural language text using Gemini API
 * @param text The natural language description of the query
 * @returns A promise that resolves to the generated SQL query
 */
export async function generateSqlFromText(text: string): Promise<string> {
  try {
    console.log("Generating SQL from text:", text);
    
    // // For demonstration purposes, if no API key is provided, return a mock response
    // if (API_KEY === "AIzaSyAgVRDntTKqy16BqkaM_SfPx7R-GqJcw0M") {
    //   return mockGenerateSql(text);
    // }

// console.log("Generating SQL from text:", text);


    // Create a prompt that instructs Gemini to convert text to SQL
    const prompt = `
      Convert the following natural language query to SQL. 
      Only return the SQL query without any explanations or markdown formatting.
      
      Natural language query: "${text}"
    `;

    

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sqlQuery = response.text();

    // console.log("Generated SQL query:", sqlQuery.trim());
    
    
    return sqlQuery.trim();
  } catch (error) {
    console.error("Error generating SQL:", error);
    throw new Error("Failed to generate SQL query. Please try again later.");
  }
}

/**
 * Mock function to generate SQL from text when no API key is provided
 * @param text The natural language description of the query
 * @returns A mock SQL query
 */
function mockGenerateSql(text: string): string {
  // Simple mapping of common phrases to SQL queries for demonstration
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("last 30 days") || lowerText.includes("last month")) {
    return `SELECT * FROM users 
WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
ORDER BY created_at DESC;`;
  } 
  
  if (lowerText.includes("top 5") && lowerText.includes("product")) {
    return `SELECT p.product_id, p.name, SUM(o.quantity * o.price) as total_sales
FROM products p
JOIN order_items o ON p.product_id = o.product_id
GROUP BY p.product_id, p.name
ORDER BY total_sales DESC
LIMIT 5;`;
  }
  
  if (lowerText.includes("spent more than") || lowerText.includes("$1000")) {
    return `SELECT c.customer_id, c.name, c.email, SUM(o.total_amount) as total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name, c.email
HAVING total_spent > 1000
ORDER BY total_spent DESC;`;
  }
  
  // Default response for other queries
  return `SELECT * FROM users
WHERE active = true
ORDER BY created_at DESC
LIMIT 10;`;
}