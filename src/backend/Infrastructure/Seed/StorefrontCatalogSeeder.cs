using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Seed;

public sealed class StorefrontCatalogSeeder(AppDbContext dbContext)
{
    private static readonly IReadOnlyList<SeedCategory> Categories =
    [
        new("Headphones & Audio", "/images/products/category-headphones-audio.jpg"),
        new("Smartwatches & Wearables", "/images/products/category-smartwatch.jpg"),
        new("Computer Accessories", "/images/products/category-computer-accessories.jpg"),
        new("Chargers & Power Banks", "/images/products/category-chargers-power-banks.jpg"),
        new("Cables & Connectivity", "/images/products/category-cables-connectivity.jpg"),
        new("Speakers & Home Electronics", "/images/products/category-speakers-home-electronics.jpg")
    ];

    private static readonly IReadOnlyList<SeedProduct> Products =
    [
        new("Northstar QuietTone ANC Headphones", "HT-AUDIO-001", "880100000001", 3499, 5999, 18, 4, "Hybrid active noise cancellation, 40-hour battery life, and plush memory-foam ear cups for focused listening.", 0),
        new("Northstar Studio Wireless Headphones", "HT-AUDIO-002", "880100000002", 1899, 3299, 24, 5, "Balanced wireless over-ear headphones with a comfortable headband and clear calls.", 0),
        new("Northstar AirBeat Earbuds", "HT-AUDIO-003", "880100000003", 999, 1799, 32, 6, "Compact true wireless earbuds with a pocket charging case and low-latency listening mode.", 0),
        new("Northstar FlexSport Earbuds", "HT-AUDIO-004", "880100000004", 749, 1299, 27, 5, "Sweat-resistant earbuds with secure ear hooks for commutes and workouts.", 0),
        new("Northstar USB-C DAC Adapter", "HT-AUDIO-005", "880100000005", 349, 649, 40, 8, "Pocket-sized USB-C audio adapter for clean, reliable wired listening.", 0),
        new("Northstar Studio Mic", "HT-AUDIO-006", "880100000006", 1199, 2199, 14, 3, "USB condenser microphone with a stable desktop stand for calls, streams, and recordings.", 0),
        new("Northstar FitTime Active Watch", "HT-WEAR-001", "880100000007", 2399, 3999, 16, 4, "Bright fitness smartwatch with activity tracking, notifications, and multi-day battery life.", 1),
        new("Northstar Pulse Mini Watch", "HT-WEAR-002", "880100000008", 1499, 2599, 21, 5, "Lightweight everyday smartwatch with health snapshots and interchangeable bands.", 1),
        new("Northstar Trail GPS Watch", "HT-WEAR-003", "880100000009", 3199, 5499, 9, 3, "Rugged GPS wearable with route tracking, elevation data, and a durable case.", 1),
        new("Northstar Active Band", "HT-WEAR-004", "880100000010", 699, 1199, 38, 8, "Slim activity band for steps, sleep trends, and quiet daily reminders.", 1),
        new("Northstar Watch Stand", "HT-WEAR-005", "880100000011", 299, 549, 30, 6, "Minimal desktop stand that keeps a smartwatch visible and ready to charge.", 1),
        new("Northstar Comfort Silicone Band", "HT-WEAR-006", "880100000012", 199, 399, 55, 10, "Soft replacement watch band with a secure pin closure and breathable finish.", 1),
        new("Northstar Precision Wireless Mouse", "HT-COMP-001", "880100000013", 499, 899, 42, 8, "Quiet-click wireless mouse with an accurate sensor and comfortable palm support.", 2),
        new("Northstar Mechanical Keyboard 75", "HT-COMP-002", "880100000014", 1699, 2899, 19, 4, "Compact mechanical keyboard with tactile switches, white backlight, and USB-C connection.", 2),
        new("Northstar Slim Office Keyboard", "HT-COMP-003", "880100000015", 599, 1099, 34, 7, "Low-profile keyboard designed for quiet, comfortable desk work.", 2),
        new("Northstar 1080p Webcam", "HT-COMP-004", "880100000016", 899, 1599, 23, 5, "Plug-and-play webcam with a wide view and automatic light balancing.", 2),
        new("Northstar Laptop Stand", "HT-COMP-005", "880100000017", 749, 1399, 26, 6, "Foldable aluminum stand that raises a laptop for a cleaner, more comfortable setup.", 2),
        new("Northstar USB Hub 7-Port", "HT-COMP-006", "880100000018", 649, 1199, 31, 7, "Seven-port USB hub with a braided cable for expanding a modern workstation.", 2),
        new("Northstar 65W GaN Charger", "HT-POWER-001", "880100000019", 999, 1799, 28, 6, "Compact GaN wall charger with enough power for phones, tablets, and many laptops.", 3),
        new("Northstar 100W Desktop Charger", "HT-POWER-002", "880100000020", 1499, 2699, 17, 4, "Four-port desktop charger for a tidy multi-device charging station.", 3),
        new("Northstar 20,000mAh Power Bank", "HT-POWER-003", "880100000021", 899, 1599, 25, 5, "High-capacity power bank with USB-C input and fast charging support.", 3),
        new("Northstar Pocket Power Bank", "HT-POWER-004", "880100000022", 499, 899, 44, 9, "Slim emergency power bank that slips easily into a pocket or small bag.", 3),
        new("Northstar Wireless Charging Pad", "HT-POWER-005", "880100000023", 399, 749, 36, 8, "Simple non-slip wireless charging pad for compatible phones and earbuds.", 3),
        new("Northstar Car Charger Duo", "HT-POWER-006", "880100000024", 299, 549, 48, 10, "Dual-port car charger for dependable road-trip charging.", 3),
        new("Northstar Braided USB-C Cable", "HT-CABLE-001", "880100000025", 149, 299, 75, 12, "Durable braided USB-C cable for charging and everyday data transfer.", 4),
        new("Northstar USB-C to Lightning Cable", "HT-CABLE-002", "880100000026", 199, 399, 62, 10, "Flexible charging cable for Lightning devices with reinforced connectors.", 4),
        new("Northstar HDMI 2.1 Cable", "HT-CABLE-003", "880100000027", 249, 499, 40, 8, "High-speed HDMI cable for modern displays, consoles, and home cinema setups.", 4),
        new("Northstar DisplayPort Cable", "HT-CABLE-004", "880100000028", 299, 599, 29, 6, "Reliable DisplayPort cable for high-resolution desktop monitors.", 4),
        new("Northstar 5-in-1 USB-C Adapter", "HT-CABLE-005", "880100000029", 549, 999, 33, 7, "Travel-friendly adapter with HDMI, USB, and card-reader connectivity.", 4),
        new("Northstar Cat6 Ethernet Cable", "HT-CABLE-006", "880100000030", 99, 199, 90, 15, "Flexible Cat6 cable for stable home and office wired networking.", 4),
        new("Northstar RoomFill Bluetooth Speaker", "HT-SPEAKER-001", "880100000031", 1599, 2899, 18, 4, "Room-filling Bluetooth speaker with warm sound and all-day playback.", 5),
        new("Northstar Pocket Speaker", "HT-SPEAKER-002", "880100000032", 499, 899, 35, 7, "Small portable speaker with a surprisingly full sound and travel-friendly size.", 5),
        new("Northstar Smart Desk Lamp", "HT-SPEAKER-003", "880100000033", 699, 1299, 22, 5, "Adjustable smart desk lamp with warm-to-cool light for work and winding down.", 5),
        new("Northstar HomeHub Display", "HT-SPEAKER-004", "880100000034", 2199, 3899, 11, 3, "Compact smart display for timers, music, and a connected home overview.", 5),
        new("Northstar Desktop Soundbar", "HT-SPEAKER-005", "880100000035", 1199, 2199, 15, 4, "Space-saving desktop soundbar for clearer work calls and richer desk audio.", 5),
        new("Northstar Digital Alarm Clock", "HT-SPEAKER-006", "880100000036", 399, 749, 41, 8, "Clean bedside alarm clock with a readable display and soft night mode.", 5),
        new("Northstar Travel Adapter Kit", "HT-POWER-007", "880100000037", 799, 1499, 20, 4, "Universal travel adapter kit with USB charging ports for common destinations.", 3),
        new("Northstar Cable Organizer Set", "HT-CABLE-007", "880100000038", 129, 249, 68, 12, "Reusable cable organizers that keep chargers and desk cables under control.", 4),
        new("Northstar Monitor Light Bar", "HT-COMP-007", "880100000039", 899, 1699, 13, 3, "Glare-conscious monitor light bar that frees desk space and softens late work sessions.", 2),
        new("Northstar ANC Travel Earbuds", "HT-AUDIO-007", "880100000040", 1299, 2299, 20, 4, "Travel-ready earbuds with active noise cancellation and a compact charging case.", 0)
    ];

    public async Task<SeedSummary> SeedAsync(CancellationToken cancellationToken = default)
    {
        var existingCategories = await dbContext.Categories.ToListAsync(cancellationToken);
        var categoriesByName = existingCategories.ToDictionary(category => category.Name.Trim(), StringComparer.OrdinalIgnoreCase);
        var addedCategories = 0;

        foreach (var seedCategory in Categories)
        {
            if (categoriesByName.ContainsKey(seedCategory.Name))
            {
                continue;
            }

            var category = new Category { Name = seedCategory.Name };
            dbContext.Categories.Add(category);
            categoriesByName[seedCategory.Name] = category;
            addedCategories++;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var existingSkus = await dbContext.Products
            .Select(product => product.SKU)
            .ToHashSetAsync(cancellationToken);
        var existingSeededProducts = await dbContext.Products
            .Where(product => product.SKU.StartsWith("HT-"))
            .ToDictionaryAsync(product => product.SKU, StringComparer.OrdinalIgnoreCase, cancellationToken);
        var addedProducts = 0;
        var skippedProducts = 0;

        foreach (var seedProduct in Products)
        {
            if (existingSkus.Contains(seedProduct.Sku))
            {
                if (existingSeededProducts.TryGetValue(seedProduct.Sku, out var existingSeededProduct))
                {
                    existingSeededProduct.ImageUrl = GetProductImagePath(seedProduct);
                }

                skippedProducts++;
                continue;
            }

            var category = categoriesByName[Categories[seedProduct.CategoryIndex].Name];
            dbContext.Products.Add(new Product
            {
                Name = seedProduct.Name,
                Description = seedProduct.Description,
                ImageUrl = GetProductImagePath(seedProduct),
                CategoryId = category.Id,
                StockQuantity = seedProduct.StockQuantity,
                CostPrice = seedProduct.CostPrice,
                SellingPrice = seedProduct.SellingPrice,
                Barcode = seedProduct.Barcode,
                SKU = seedProduct.Sku,
                LowStockThreshold = seedProduct.LowStockThreshold,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            addedProducts++;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return new SeedSummary(addedCategories, addedProducts, skippedProducts);
    }

    private static string GetProductImagePath(SeedProduct seedProduct) =>
        $"/images/products/{seedProduct.Sku.ToLowerInvariant()}.jpg";

    private sealed record SeedCategory(string Name, string ImageUrl);

    private sealed record SeedProduct(
        string Name,
        string Sku,
        string Barcode,
        decimal CostPrice,
        decimal SellingPrice,
        int StockQuantity,
        int LowStockThreshold,
        string Description,
        int CategoryIndex);
}

public sealed record SeedSummary(int AddedCategories, int AddedProducts, int SkippedProducts);