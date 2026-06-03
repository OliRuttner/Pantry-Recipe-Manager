using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _service;

        public InventoryController(IInventoryService service)
        {
            _service = service;
        }

        // 1. READ ALL: api/Inventory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Item>>> GetInventory()
        {
            return await _service.GetAllItemsAsync();
        }

        // 2. READ ONE: api/Inventory/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Item>> GetItem(int id)
        {
            var item = await _service.GetItemByIdAsync(id);

            if (item == null)
                return NotFound();

            return item;
        }

        // 3. CREATE: api/Inventory
        [HttpPost]
        public async Task<ActionResult<Item>> PostItem(Item item)
        {
            try
            {
                var createdItem = await _service.CreateItemAsync(item);

                return CreatedAtAction(
                    nameof(GetItem),
                    new { id = createdItem.Id },
                    createdItem
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // 4. UPDATE: api/Inventory/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutItem(int id, Item item)
        {
            try
            {
                var success = await _service.UpdateItemAsync(id, item);

                if (!success)
                    return BadRequest();

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // 5. DELETE: api/Inventory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var success = await _service.DeleteItemAsync(id);

            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}