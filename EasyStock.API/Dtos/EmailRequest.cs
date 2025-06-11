namespace EasyStock.API.Dtos
{
    public class EmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
    public class IncidentTicket
    {
        public string Sender { get; set; } = string.Empty;
        public string ProblemType { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
    
}