import { prisma } from "@/lib/prisma";
import CreateBrandForm from "./parts/CreateBrandForm";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hãng (Brand)</h1>
      </header>

      <CreateBrandForm />

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left w-14">#</th>
              <th className="p-2 text-left">Tên</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b, idx) => (
              <tr key={b.id} className="border-t">
                <td className="p-2">{idx + 1}</td>
                <td className="p-2">{b.name}</td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={2}>
                  Chưa có hãng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
