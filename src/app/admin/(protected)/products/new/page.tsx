import ProductForm from "@/components/admin/ProductForm";
export default function NewProductPage() {
  return (
    <div className="max-w">
      <h1 className="text-2xl font-semibold mb-4">Thêm sản phẩm</h1>
      <ProductForm mode="create" />
    </div>
  );
}
