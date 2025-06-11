using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Stripe;
using Stripe.Checkout;
using EasyStock.API.Dtos;
using Evt = Stripe.Events;
namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private const string ConnStr = "Server=localhost;Database=easystock;User ID=root;Password=root;";
        private const string EndpointSecret = "whsec_eaf1664015741a292256d3b2794edc32efc0b7404e032422a3cbc3e58e519292"; // Remplace par ta vraie clé webhook Stripe

        public PaymentController()
        {
            StripeConfiguration.ApiKey = "sk_test_51RYMdQBThlU1yLe3kSApIHQgV2wCwGMbsWSWgQipNW5EOVpfuesNE3Klg5lDnsyqoKbsiRs2Jef67WETVd94mrVa00cyBaUAir";
        }

        // ✅ Crée une session Stripe Checkout
        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutRequestDto req)
        {
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                Mode = "subscription",
                CustomerEmail = req.Email,
                ClientReferenceId = req.UserId.ToString(),
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Price = "price_1RYMlBBThlU1yLe3jKVNvfUX",
                        Quantity = 1,
                    }
                },
                SuccessUrl = "http://localhost:4200/success",
                CancelUrl = "http://localhost:4200/cancel",
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            return Ok(new { url = session.Url });
        }

        // ✅ Webhook Stripe : paiement réussi ou échoué
        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    EndpointSecret
                );
        
                Console.WriteLine($"🎯 Type d’événement Stripe : {stripeEvent.Type}");
                Console.WriteLine($"📦 Données reçues : {json}");
        
                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;
                    Console.WriteLine("✅ [Webhook] Paiement Stripe réussi pour session : " + session?.Id);
                    Console.WriteLine("ℹ️ Attente de confirmation frontend (POST /set-admin) pour promotion des droits.");
                }

                else if (stripeEvent.Type == "invoice.payment_failed")
                {
                    var invoice = stripeEvent.Data.Object as Invoice;
                    Console.WriteLine($"❌ Paiement échoué pour client Stripe : {invoice?.CustomerId}");
                }
        
                return Ok();
            }
            catch (StripeException e)
            {
                Console.WriteLine("❌ Stripe Webhook erreur : " + e.Message);
                return StatusCode(400);
            }
        }
        [HttpPost("set-admin")]
        public IActionResult SetAdmin([FromBody] SetAdminDto dto)
        {
            int userId = dto.UserId;
            Console.WriteLine($"📥 Reçu demande de set-admin pour userId={userId}");
        
            using var connection = new MySqlConnection(ConnStr);
            connection.Open();
        
            var command = new MySqlCommand("UPDATE users SET is_admin = 1 WHERE id = @userId", connection);
            command.Parameters.AddWithValue("@userId", userId);
            var affected = command.ExecuteNonQuery();
        
            if (affected > 0)
            {
                Console.WriteLine($"✅ L'utilisateur avec ID={userId} est maintenant admin.");
                return Ok(new { message = "✅ OK" });
            }
            else
            {
                Console.WriteLine($"⚠️ Aucun utilisateur trouvé avec ID={userId}. Mise à jour échouée.");
                return NotFound(new { error = "❌ Utilisateur non trouvé" });
            }
        }
        }
    }

       
