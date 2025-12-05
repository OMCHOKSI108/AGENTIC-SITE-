# Testing script for AI agents
# This script creates user Rahul, logs in, and tests all AI agents one by one
# All output is stored in agent_test_results.txt

$resultsFile = "d:\OM\agentic-site-\agent_test_results.txt"

# Clear previous results
"" | Out-File -FilePath $resultsFile

# Step 1: Create user Rahul (if not exists)
Write-Host "Step 1: Creating user Rahul..."
$createUserBody = @{
    name = "Rahul"
    email = "rahul@example.com"
    username = "rahul"
    password = "rahul123"
    number = "1111111111"
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body $createUserBody
    "User creation response: $($createResponse.Content)" | Out-File -FilePath $resultsFile -Append
} catch {
    "User creation failed or already exists: $($_.Exception.Message)" | Out-File -FilePath $resultsFile -Append
}

# Step 2: Login to get token
Write-Host "Step 2: Logging in as Rahul..."
$loginBody = @{
    identifier = "rahul@example.com"
    password = "rahul123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token
"Login successful. Token: $token" | Out-File -FilePath $resultsFile -Append

$headers = @{"Authorization" = "Bearer $token"}

# Step 3: Test each AI agent
$agents = @(
    @{slug="resume_opt"; params=@{resume_file="John Doe`nSoftware Engineer`nExperience: 5 years"; job_description="Senior Software Engineer position"}},
    @{slug="code_fix_agent"; params=@{code_snippet="console.log('hello')"; language="javascript"}},
    @{slug="sql_generator"; params=@{question="Get all users with their email addresses"; schema="users(id INTEGER PRIMARY KEY, name VARCHAR(255), email VARCHAR(255))"}};
    @{slug="cloud_cost_agent"; params=@{billing_file="Service,Cost,Region`nEC2,450.30,us-east-1`nRDS,320.50,us-west-2`nS3,180.25,global"}};
    @{slug="cicd_agent"; params=@{project_description="Node.js Express API with MongoDB"}},
    @{slug="log_anomaly_agent"; params=@{log_text="ERROR: Database connection failed"}},
    @{slug="terraform_agent"; params=@{infrastructure_description="VPC with public and private subnets"}},
    @{slug="dockerizer_agent"; params=@{code_snippet="const express = require('express'); const app = express(); app.listen(3000);"}},
    @{slug="trading_backtester"; params=@{strategy_logic="Buy when price crosses above 20-day moving average, sell when it crosses below"; csv_data="Date,Price,Volume`n2023-01-01,100.00,1000000`n2023-01-02,101.50,1200000`n2023-01-03,99.80,900000"}};
    @{slug="crypto_sentiment_agent"; params=@{coin_symbol="BTC"}},
    @{slug="eda_agent"; params=@{csv_upload="Name,Age,Salary`nJohn,25,50000`nJane,30,60000`nBob,35,70000"}};
    @{slug="financial_report_agent"; params=@{pdf_content="Company XYZ Financial Report`nRevenue: $1.2M`nExpenses: $800K`nNet Profit: $400K`nKey highlights: Strong growth in Q4"}};
    @{slug="api_docs_agent"; params=@{code_file="const express = require('express');`nconst app = express();`n`napp.get('/users', (req, res) => {`n  res.json([{id: 1, name: 'John'}]);`n});`n`napp.post('/users', (req, res) => {`n  // Create user`n});"}};
    @{slug="readme_architect"; params=@{repo_url="https://github.com/example/my-awesome-project"}};
    @{slug="regex_generator"; params=@{requirement="Match valid email addresses"}};
    @{slug="contract_auditor"; params=@{contract_content="This agreement is between Party A and Party B. Party A agrees to provide services. Termination requires 30 days notice. All disputes shall be resolved in the courts of California."}};
    @{slug="cold_outreach_agent"; params=@{company_url="https://techcorp.com"; offer="AI consulting services to improve their development workflow"}};
    @{slug="meet_scribe"; params=@{audio_file="dummy_audio.mp3"}};
    @{slug="youtube_finder"; params=@{query_or_playlist_url="machine learning tutorials"}};
    @{slug="kb_agent"; params=@{query="What is machine learning?"; documents=@("d:\OM\agentic-site-\test_doc.txt")}};
    @{slug="n8n_architect"; params=@{goal="Automate sending email notifications when new users sign up to my application"}};
)

foreach ($agent in $agents) {
    Write-Host "Testing agent: $($agent.slug)"
    "=== Testing $($agent.slug) ===" | Out-File -FilePath $resultsFile -Append

    try {
        $body = $agent.params | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/agents/$($agent.slug)/run" -Method POST -Headers $headers -ContentType "application/json" -Body $body
        $result = $response.Content
        "SUCCESS: $result" | Out-File -FilePath $resultsFile -Append
    } catch {
        "ERROR: $($_.Exception.Message)" | Out-File -FilePath $resultsFile -Append
    }

    "`n" | Out-File -FilePath $resultsFile -Append
    Start-Sleep -Seconds 1  # Small delay between tests
}

Write-Host "Testing completed. Results saved to $resultsFile"