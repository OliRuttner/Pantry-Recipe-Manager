using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InventoryController(AppDbContext context)
        {
            _context = context;
        }

        // 1. READ ALL: api/Inventory
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Item>>> GetInventory()
        {
            return await _context.Items.ToListAsync();
        }

        // 2. READ ONE: api/Inventory/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Item>> GetItem(int id)
        {
            var item = await _context.Items.FindAsync(id);

            if (item == null) return NotFound();

            return item;
        }

        // 3. CREATE: api/Inventory
        [HttpPost]
        public async Task<ActionResult<Item>> PostItem(Item item)
        {
            // EF is smart: if you send an ExpirationDate, 
            // it will treat it as a PerishableItem automatically.
            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }

        // 4. UPDATE: api/Inventory/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutItem(int id, Item item)
        {
            if (id != item.Id) return BadRequest();

            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Items.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // 5. DELETE: api/Inventory/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null) return NotFound();

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}