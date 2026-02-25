"use client";

import { useState, useEffect } from "react";
import { useRef } from "react";
import Link from "next/link";

export default function EscalasPage() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [processedText, setProcessedText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleProcessImage = async () => {
    if (!image) return;

    setLoading(true);
    setText("");

    try {
      
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setText(data.text);

      //const texto = `< Escalas Visualize por Departamento Mídia Escala Individual Escala Completa Mês atual Próximo mês Todos Dom, 22 de Fev. 09:30 Computador Telão - Junior Ferreira 09:30 | Gravação - Gabriella Purlan - 09:30 | Live Flavia Gabriela Lucio De Lima 19:00 | Computador Telão - Junior Ferreira 19:00 | Fotografia - Alessandra Simao 19:00 | Gravação - Eloisa Souza De Faria 19:00 | Gravação - Flavia Da Costa Chaves - 19:00 | Live Joao Pedro Dos Reis Chaves Diniz Home ||| = 44`
      const texto = data.text

      // 🔹 Mapeamento de meses
      const meses: Record<string, string> = {
        Jan: "01",
        Fev: "02",
        Mar: "03",
        Abr: "04",
        Mai: "05",
        Jun: "06",
        Jul: "07",
        Ago: "08",
        Set: "09",
        Out: "10",
        Nov: "11",
        Dez: "12",
      }

      // ✅ 1️⃣ Captura data no padrão "Qua, 25 de Fev."
      const dataRegex =
        /(Dom|Seg|Ter|Qua|Qui|Sex|Sáb|Sab),\s*(\d{1,2})\s+de\s+(\w{3})\./

      const match = texto.match(dataRegex)

      if (!match) {
        throw new Error("Data não encontrada")
      }

      const dia = match[2].padStart(2, "0")
      const mes = meses[match[3]]

      if (!mes) {
        throw new Error("Mês inválido detectado pelo OCR")
      }

      const novaData = `2026-${mes}-${dia}`

      // ✅ 2️⃣ Remove tudo antes da data encontrada
      let resultado = texto.slice(match.index! + match[0].length)

      // ✅ 3️⃣ Limpeza básica
      resultado = resultado.replace(/\s+/g, " ").trim()
      resultado = resultado.replace(/\sHome.*$/i, "").trim()

      // ✅ 4️⃣ Garantir formatação padrão
      resultado = resultado.replace(/(\d{2}:\d{2})(?!\s*\|)/g, "$1 |")

      resultado = resultado.replace(
        /(Gravação|Gravacao|Computador Telão|Computador Telao|Fotografia|Live)(?!\s*-)/g,
        "$1 -"
      )

      // --------------------------------------------------
      // ✅ 5️⃣ EXTRAÇÃO SEGURA (ignora qualquer lixo depois)
      // --------------------------------------------------

      const regex =
        /(\d{2}:\d{2})\s*\|\s*([^-\|]+?)\s*-\s*([^\d]+?)(?=\s\d{2}:\d{2}|\s*$)/g

      const linhas: string[] = []

      let match2

      while ((match2 = regex.exec(resultado)) !== null) {
        const hora = match2[1]
        const tipo = match2[2].trim()
        const nome = match2[3].trim()

        linhas.push(`${novaData}, ${hora}, ${tipo}, ${nome}`)
      }

      console.log(linhas.join("\n"))
      setProcessedText(linhas.join("\n"))

    } catch (error) {
      console.error(error);
      setText("Erro ao processar imagem.");
    }    

    setLoading(false);
  };

  const handleSave = async () => {
    const linhas = processedText.split("\n").filter(Boolean);

    const dados = linhas.map((linha) => {
      const [data, horario, funcao, nome] = linha
        .split(",")
        .map((s) => s.trim());

      return { data, horario, funcao, nome };
    });

    const response = await fetch("/api/escalas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (response.ok) {
      setSuccessMessage("Dados salvos com sucesso!");

      // limpa tudo
      setImage(null);
      setText("");
      setProcessedText("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } else {
      alert("Erro ao salvar");
    }
  };

  return (
    <main className="bg-zinc-950 min-h-screen text-white">
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 animate-slideIn">
          <div className="
            bg-emerald-600
            text-white
            px-6 py-4
            rounded-2xl
            shadow-2xl
            flex items-center gap-3
            min-w-[280px]
          ">
            <div className="text-xl">✅</div>
            <div className="text-sm font-medium">
              {successMessage}
            </div>
          </div>
        </div>
      )}
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
              ref={fileInputRef}
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

          {/* Resultado Processado */}
          {processedText && (
            <div className="mt-8">
              <p className="text-sm text-zinc-400 mb-2">
                Resultado Processado (editável):
              </p>

              <textarea
                value={processedText}
                onChange={(e) => setProcessedText(e.target.value)}
                className="
                  w-full
                  bg-black
                  border border-zinc-800
                  rounded-xl
                  p-4
                  min-h-[200px]
                  text-sm
                  text-zinc-300
                  focus:outline-none
                  focus:border-white
                  resize-none
                "
              />
              <button
                onClick={handleSave}
                className="mt-4 bg-green-600 px-4 py-2 rounded-lg"
              >
                Salvar no banco
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}