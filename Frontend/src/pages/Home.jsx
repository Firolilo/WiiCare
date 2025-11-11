export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 from-white to-[#f5f0e8] min-h-[calc(90vh-80px)]">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-[#2e2e2e] mb-3">
          Bienvenido a <span className="text-[#2B4C7E]">WiiCare</span>
        </h1>
        <p className="text-base text-gray-700 mb-6 leading-relaxed">
          La plataforma que conecta <span className="font-semibold text-[#2B4C7E]">cuidadores</span> y
          <span className="font-semibold text-[#2B4C7E]"> personas con necesidades especiales</span>. 
          Publica servicios, comparte experiencias y brinda apoyo humano con tecnología.
        </p>
        <div className="flex justify-center gap-3">
          <button className="bg-[#2B4C7E] text-white px-5 py-2 rounded-full hover:bg-[#3e64a3] transition">
            Explorar servicios
          </button>
          <button className="border border-[#2B4C7E] text-[#2B4C7E] px-5 py-2 rounded-full hover:bg-[#e4e9f3] transition">
            Unirme como cuidador
          </button>
        </div>
      </div>
    </section>
  );
}