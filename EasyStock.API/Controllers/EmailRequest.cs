namespace EasyStock.API.Dtos
{
    public class EmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
}