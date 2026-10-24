using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Product> Products => Set<Product>();

    public DbSet<Supplier> Suppliers => Set<Supplier>();

    public DbSet<Customer> Customers => Set<Customer>();

    public DbSet<AppUser> Users => Set<AppUser>();

    public DbSet<Purchase> Purchases => Set<Purchase>();

    public DbSet<Sale> Sales => Set<Sale>();

    public DbSet<SaleItem> SaleItems => Set<SaleItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(product => product.Name).HasMaxLength(150).IsRequired();
            entity.Property(product => product.Description).HasMaxLength(1000);
            entity.Property(product => product.ImageUrl).HasMaxLength(1000);
            entity.Property(product => product.Barcode).HasMaxLength(32).IsRequired();
            entity.Property(product => product.SKU).HasMaxLength(50).IsRequired();
            entity.Property(product => product.CostPrice).HasPrecision(18, 2);
            entity.Property(product => product.SellingPrice).HasPrecision(18, 2);
            entity.Property(product => product.CreatedAt).HasColumnType("TEXT");
            entity.Property(product => product.UpdatedAt).HasColumnType("TEXT");

            entity.HasIndex(product => product.Barcode).IsUnique();
            entity.HasIndex(product => product.SKU).IsUnique();

            entity.HasOne(product => product.Category)
                .WithMany(category => category.Products)
                .HasForeignKey(product => product.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.Property(supplier => supplier.Name).HasMaxLength(150).IsRequired();
            entity.Property(supplier => supplier.Company).HasMaxLength(150).IsRequired();
            entity.Property(supplier => supplier.Email).HasMaxLength(254).IsRequired();
            entity.Property(supplier => supplier.Phone).HasMaxLength(40).IsRequired();
            entity.Property(supplier => supplier.Address).HasMaxLength(500).IsRequired();
            entity.Property(supplier => supplier.CreatedAt).HasColumnType("TEXT");
            entity.Property(supplier => supplier.UpdatedAt).HasColumnType("TEXT");

            entity.HasIndex(supplier => supplier.Name);
            entity.HasIndex(supplier => supplier.Company);
            entity.HasIndex(supplier => supplier.Email);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.Property(customer => customer.Name).HasMaxLength(150).IsRequired();
            entity.Property(customer => customer.Email).HasMaxLength(254).IsRequired();
            entity.Property(customer => customer.Phone).HasMaxLength(40).IsRequired();
            entity.Property(customer => customer.Address).HasMaxLength(500).IsRequired();
            entity.Property(customer => customer.CreatedAt).HasColumnType("TEXT");
            entity.Property(customer => customer.UpdatedAt).HasColumnType("TEXT");

            entity.HasIndex(customer => customer.Name);
            entity.HasIndex(customer => customer.Email);
        });

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.Property(user => user.Username).HasMaxLength(100).IsRequired();
            entity.Property(user => user.PasswordHash).HasMaxLength(500).IsRequired();
            entity.Property(user => user.Role).HasMaxLength(50).IsRequired();
            entity.Property(user => user.CreatedAt).HasColumnType("TEXT");
            entity.Property(user => user.UpdatedAt).HasColumnType("TEXT");

            entity.HasIndex(user => user.Username).IsUnique();
        });

        modelBuilder.Entity<Purchase>(entity =>
        {
            entity.Property(purchase => purchase.UnitCost).HasPrecision(18, 2);
            entity.Property(purchase => purchase.PurchaseDate).HasColumnType("TEXT");
            entity.Property(purchase => purchase.CreatedAt).HasColumnType("TEXT");
            entity.Property(purchase => purchase.UpdatedAt).HasColumnType("TEXT");

            entity.HasIndex(purchase => purchase.SupplierId);
            entity.HasIndex(purchase => purchase.ProductId);
            entity.HasIndex(purchase => purchase.PurchaseDate);

            entity.HasOne(purchase => purchase.Supplier)
                .WithMany()
                .HasForeignKey(purchase => purchase.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(purchase => purchase.Product)
                .WithMany()
                .HasForeignKey(purchase => purchase.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Sale>(entity =>
        {
            entity.Property(sale => sale.SaleDate).HasColumnType("TEXT");
            entity.Property(sale => sale.CreatedAt).HasColumnType("TEXT");
            entity.Property(sale => sale.UpdatedAt).HasColumnType("TEXT");

            entity.HasIndex(sale => sale.CustomerId);
            entity.HasIndex(sale => sale.SaleDate);

            entity.HasOne(sale => sale.Customer)
                .WithMany()
                .HasForeignKey(sale => sale.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SaleItem>(entity =>
        {
            entity.Property(saleItem => saleItem.UnitPrice).HasPrecision(18, 2);
            entity.Property(saleItem => saleItem.CreatedAt).HasColumnType("TEXT");
            entity.Property(saleItem => saleItem.UpdatedAt).HasColumnType("TEXT");

            entity.HasIndex(saleItem => saleItem.SaleId);
            entity.HasIndex(saleItem => saleItem.ProductId);

            entity.HasOne(saleItem => saleItem.Sale)
                .WithMany(sale => sale.Items)
                .HasForeignKey(saleItem => saleItem.SaleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(saleItem => saleItem.Product)
                .WithMany()
                .HasForeignKey(saleItem => saleItem.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
