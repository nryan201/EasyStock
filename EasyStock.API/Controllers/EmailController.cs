using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;

namespace EasyStock.API.Controllers
{
    [ApiController]
    [Route("api/email")]
    public class EmailController : ControllerBase
    {
        // Tu peux aussi stocker les codes ici si tu veux les vérifier plus tard
        private static Dictionary<string, string> _codes = new();

        [HttpPost("send-code")]
        public IActionResult SendEmail([FromBody] EmailRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.To))
            {
                return BadRequest(new { error = "L'adresse e-mail est requise." });
            }

            try
            {
                var code = new Random().Next(100000, 999999).ToString(); // Code à 6 chiffres
                _codes[request.To] = code; // Stocké en mémoire (si tu veux le vérifier plus tard)

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

                return Ok(new { message = "E-mail envoyé avec succès.", code }); // tu peux retirer `code` ici pour ne pas l’afficher
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        public class EmailRequest
        {
            public string To { get; set; } = string.Empty;
        }
    }
}
