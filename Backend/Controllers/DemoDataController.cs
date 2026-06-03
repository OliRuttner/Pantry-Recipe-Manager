using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DemoDataController : ControllerBase
    {
        private readonly IDemoDataService _demoDataService;

        public DemoDataController(IDemoDataService demoDataService)
        {
            _demoDataService = demoDataService;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateDemoData()
        {
            await _demoDataService.GenerateDemoDataAsync();
            return Ok(new { message = "Demo data generated successfully." });
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearDemoData()
        {
            await _demoDataService.ClearDemoDataAsync();
            return Ok(new { message = "Demo data cleared successfully." });
        }
    }
}