namespace EasyStock.API.Dtos
{

    public class CreateCheckoutRequestDto
    {
        public int UserId { get; set; }
        public string Email { get; set; }
    }
    public class SetAdminDto
    {
        public int UserId { get; set; }
    }
}