"use client";

import { useState } from "react";
import Link from "next/link";
import Tesseract from "tesseract.js";

export default function EscalasPage() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleProcessImage = async () => {
    if (!image) return;

    setLoading(true);
    setText("");

    const { data } = await Tesseract.recognize(image, "por");
    setText(data.text);

    setLoading(false);
  };

  return (
    <main className="bg-zinc-950 min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            📋 Leitor de Escalas
          </h1>

          <Link href="/">
            <button className="
              border border-neutral-600
              px-4 py-2
              rounded-full
              text-sm
              hover:bg-white hover:text-black
              transition-colors
            ">
              ← Voltar
            </button>
          </Link>
        </div>

        {/* Card principal */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-lg">

          {/* Upload */}
          <div className="mb-6">
            <label className="block text-sm mb-2 text-zinc-400">
              Envie a imagem da escala
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="
                w-full
                text-sm
                file:mr-4
                file:py-2
                file:px-4
                file:rounded-full
                file:border-0
                file:text-sm
                file:font-medium
                file:bg-white
                file:text-black
                hover:file:bg-zinc-200
                cursor-pointer
              "
            />
          </div>

          {/* Preview */}
          {image && (
            <div className="mb-6">
              <p className="text-sm text-zinc-400 mb-2">Preview:</p>
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="rounded-lg max-h-64 object-contain border border-zinc-800"
              />
            </div>
          )}

          {/* Botão Processar */}
          <div className="mb-8">
            <button
              onClick={handleProcessImage}
              disabled={loading || !image}
              className="
                w-full
                bg-white
                text-black
                py-3
                rounded-xl
                font-medium
                hover:bg-zinc-200
                transition-colors
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Processando imagem..." : "Ler imagem"}
            </button>
          </div>

          {/* Resultado */}
          <div>
            <p className="text-sm text-zinc-400 mb-2">
              Texto reconhecido:
            </p>

            <div className="
              bg-black
              border border-zinc-800
              rounded-xl
              p-4
              min-h-[200px]
              whitespace-pre-wrap
              text-sm
              text-zinc-300
            ">
              {text || "O texto extraído aparecerá aqui..."}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}