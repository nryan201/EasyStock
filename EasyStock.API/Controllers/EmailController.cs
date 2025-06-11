using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;
using EasyStock.API.Dtos;
namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/email")]
    public class EmailController : ControllerBase
    {
        private static Dictionary<string, string> _codes = new();

        [HttpPost("send-code")]
        public IActionResult SendEmail([FromBody] EmailRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.To))
                return BadRequest(new { error = "L'adresse e-mail est requise." });

            try
            {
                var code = new Random().Next(100000, 999999).ToString();
                _codes[request.To] = code;

                var fromAddress = new MailAddress("easystockYnov@gmail.com", "EasyStock");
                var toAddress = new MailAddress(request.To);
                const string fromPassword = "wcxb sfrw cszf mlsw";
                const string subject = "Votre code de sécurité";
                string body = $"Voici votre code de sécurité : {code}";

                var smtp = new SmtpClient
                {
                    Host = "smtp.gmail.com",
                    Port = 587,
                    EnableSsl = true,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(fromAddress.Address, fromPassword)
                };

                using var message = new MailMessage(fromAddress, toAddress)
                {
                    Subject = subject,
                    Body = body
                };

                smtp.Send(message);
                return Ok(new { message = "E-mail envoyé avec succès.", code });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("send-incident")]
        public IActionResult SendIncidentEmail([FromBody] IncidentTicket ticket)
        {
            if (string.IsNullOrWhiteSpace(ticket.Sender) ||
                string.IsNullOrWhiteSpace(ticket.ProblemType) ||
                string.IsNullOrWhiteSpace(ticket.Message))
            {
                return BadRequest(new { error = "Tous les champs sont requis." });
            }

            try
            {
                var fromAddress = new MailAddress("easystockYnov@gmail.com", "EasyStock");
                var toAddress = new MailAddress("easystockynov@gmail.com");
                const string fromPassword = "wcxb sfrw cszf mlsw";
                var subject = $"🛠️ Ticket incident : {ticket.ProblemType}";

                string body = $"📨 Envoyé par : {ticket.Sender}\n" +
                              $"📌 Problème : {ticket.ProblemType}\n\n" +
                              $"{ticket.Message}";

                var smtp = new SmtpClient
                {
                    Host = "smtp.gmail.com",
                    Port = 587,
                    EnableSsl = true,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(fromAddress.Address, fromPassword)
                };

                using var message = new MailMessage(fromAddress, toAddress)
                {
                    Subject = subject,
                    Body = body
                };

                smtp.Send(message);
                return Ok(new { message = "✅ Ticket envoyé au responsable réseaux." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "❌ Erreur lors de l'envoi : " + ex.Message });
            }
        }
        
    }
}
