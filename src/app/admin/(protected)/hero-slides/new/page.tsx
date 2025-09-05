import HeroForm from "@/components/admin/HeroForm";
export default function NewProductPage() {
  return (
    <div className="max-w">
      <h1 className="text-2xl font-semibold mb-4">Thêm slide</h1>
      <HeroForm mode="create" />
    </div>
  );
}
