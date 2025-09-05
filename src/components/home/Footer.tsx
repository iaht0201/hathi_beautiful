import Image from "next/image";

const FooterCustom = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
        {/* Cột 1: Logo + mô tả */}
        <div>
          <div className="text-xl font-black mb-3">
            <Image
              src="/logo_cover.png"
              alt="Logo"
              width={128}
              height={128}
              className="w-32 h-10 object-cover"
            />
          </div>
          <p className="text-muted-foreground">
            Được đưa sản phẩm chất lượng đến tay người tiêu dùng với sự tận tâm
            và chuyên nghiệp đó là nhiệm vụ cao cả của Hathi Beauty.
          </p>
        </div>

        {/* Cột 2: Google Maps */}
        <div>
          <div className="rounded-lg overflow-hidden border h-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4665020570344!2d106.70042331533426!3d10.776530892321076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a3e2b8ad7%3A0x2d2e8c2c4f5e2a11!2zU2FpZ29uIFZpZXQsIFRow6BuaCBwaOG7kSBIw6AgQ2jDrQ!5e0!3m2!1sen!2s!4v1692194576543!5m2!1sen!2s"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Phần bản quyền */}
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Hathi Beauty with love</p>
          <div className="flex items-center gap-4">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterCustom;
