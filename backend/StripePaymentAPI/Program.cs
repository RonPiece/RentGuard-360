using Stripe;
using StripePaymentAPI.Repositories;

// =============================================================================
// PROGRAM.CS - Server Configuration
// This file configures: DI, CORS, Swagger, Stripe, and the HTTP pipeline.
// =============================================================================

var builder = WebApplication.CreateBuilder(args);

// =============================================================================
// 1. DEPENDENCY INJECTION (DI) - Register the Repository
//    The controller receives IPaymentRepository in its constructor.
//    The framework automatically injects SQLPaymentRepository.
//    This prevents tight coupling (no 'new' inside the controller).
// =============================================================================
builder.Services.AddScoped<IPaymentRepository, SQLPaymentRepository>();

// =============================================================================
// 2. STRIPE CONFIGURATION
//    Set the Stripe API key so the SDK can talk to Stripe's servers.
//    The key is read from appsettings.json (local) or environment variables (AWS).
// =============================================================================
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

// =============================================================================
// 2.5 DB MIGRATION / HOTFIX
//    Update 'unlimited' packages to have exactly 15 scans, as the unlimited
//    option is being replaced entirely.
// =============================================================================
try
{
    using (var connection = new System.Data.SqlClient.SqlConnection(builder.Configuration.GetConnectionString("PaymentsDB")))
    {
        connection.Open();
        var cmd = new System.Data.SqlClient.SqlCommand("UPDATE Packages SET ScanLimit = 15 WHERE ScanLimit = -1", connection);
        cmd.ExecuteNonQuery();
    }
}
catch (Exception ex)
{
    Console.WriteLine("Warning: DB update failed on startup: " + ex.Message);
}

// =============================================================================
// 3. ADD CONTROLLERS + SWAGGER
// =============================================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "RentGuard 360 - Payment API",
        Version = "v1",
        Description = "C# Web API for Stripe payment processing and subscription management"
    });
});

// =============================================================================
// 4. CORS (Cross-Origin Resource Sharing)
//    Required because React (CloudFront) and this API (API Gateway/Lambda)
//    run on different domains. Without CORS, the browser blocks requests.
// =============================================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("corspolicy", policy =>
    {
        policy.AllowAnyOrigin()        // Allow requests from any domain
              .AllowAnyHeader()        // Allow Content-Type, Authorization, etc.
              .AllowAnyMethod();       // Allow GET, POST, PUT, DELETE
    });
});

var app = builder.Build();

// =============================================================================
// 5. HTTP REQUEST PIPELINE
// =============================================================================

// Enable Swagger UI (for testing in browser and project defense)
app.UseSwagger();
app.UseSwaggerUI();

// Enable CORS - MUST be before MapControllers
app.UseCors("corspolicy");

// Map controller routes (e.g., api/packages, api/payments)
app.MapControllers();

app.Run();
