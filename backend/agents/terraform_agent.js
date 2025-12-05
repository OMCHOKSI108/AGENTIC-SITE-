const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function run(input) {
  const { infrastructure_description } = input;

  if (!infrastructure_description || typeof infrastructure_description !== 'string') {
    return {
      success: false,
      error: 'Please provide an infrastructure description'
    };
  }

  try {
    const prompt = `Generate production-ready Terraform code for this infrastructure requirement.

Requirement: "${infrastructure_description}"

Requirements:
1. Create a complete main.tf file with all necessary resources
2. Use AWS provider (or Azure/GCP based on context)
3. Include proper resource naming and tagging
4. Add security groups, IAM roles, and networking
5. Include variables.tf and terraform.tfvars examples
6. Add outputs.tf for important resource information
7. Include comments explaining each resource
8. Follow Terraform best practices and naming conventions
9. Ensure resources are properly connected and configured

Output the Terraform code in proper format with file structure.`;

    const result = await model.generateContent(prompt);

    let terraformCode = result.response.text().trim();

    // Clean up any markdown formatting
    terraformCode = terraformCode.replace(/```hcl\s*/g, '').replace(/```\s*$/g, '');
    terraformCode = terraformCode.replace(/```terraform\s*/g, '').replace(/```\s*$/g, '');

    const formattedResult = `# Terraform Infrastructure Code

## main.tf
\`\`\`hcl
${terraformCode}
\`\`\`

## How to Deploy

1. **Initialize Terraform:**
   \`\`\`bash
   terraform init
   \`\`\`

2. **Plan the deployment:**
   \`\`\`bash
   terraform plan
   \`\`\`

3. **Apply the changes:**
   \`\`\`bash
   terraform apply
   \`\`\`

## File Structure
Create these files in your Terraform directory:
- \`main.tf\` - Main infrastructure code (above)
- \`variables.tf\` - Input variables
- \`outputs.tf\` - Output values
- \`terraform.tfvars\` - Variable values

## Security Considerations
- Review IAM permissions before applying
- Ensure security groups are properly configured
- Consider using remote state for team collaboration
- Enable encryption for sensitive data

## Cost Estimation
Run \`terraform plan\` to see the cost estimate before applying.

## Cleanup
To destroy the infrastructure:
\`\`\`bash
terraform destroy
\`\`\`
`;

    return {
      success: true,
      output: formattedResult,
      cost: 0.035,
      time_ms: 3500
    };

  } catch (error) {
    console.error('Terraform Architect error:', error);
    return {
      success: false,
      error: `Failed to generate Terraform code: ${error.message}`
    };
  }
}

module.exports = { run };
