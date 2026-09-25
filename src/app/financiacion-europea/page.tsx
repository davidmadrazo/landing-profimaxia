import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Financiación europea FSE+ | ProfimaxIA',
  description:
    'ProfimaxIA ha sido cofinanciada por la Unión Europea a través del Fondo Social Europeo Plus (FSE+), Programa Cantabria FSE+ 2021-2027.',
}

const DATOS = [
  { k: 'Programa', v: 'Programa Cantabria FSE+ 2021-2027' },
  { k: 'Operación', v: 'Promoción del empleo autónomo joven' },
  { k: 'Persona beneficiaria', v: 'David Madrazo Martínez (ProfimaxIA)' },
  { k: 'Organismo', v: 'Servicio Cántabro de Empleo · Gobierno de Cantabria' },
  { k: 'Expediente', v: 'PEA/0678/2025' },
  { k: 'Duración', v: 'Tres años desde el alta en la Seguridad Social (07/2025 – 07/2028)' },
  { k: 'Subvención', v: '10.000 €' },
  { k: 'Ayuda UE (FSE+)', v: '6.000 € (60 %)' },
]

export default function FinanciacionEuropeaPage() {
  return (
    <main className="min-h-[100dvh] px-6 lg:px-12 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors duration-300 mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a ProfimaxIA
        </Link>

        <div className="rounded-2xl bg-white px-5 py-4 sm:px-8 sm:py-6 mb-10">
          <Image
            src="/fse/logos-fse.png"
            alt="Cofinanciado por la Unión Europea · Ministerio de Trabajo y Economía Social · Fondos Europeos · Gobierno de Cantabria · Servicio Cántabro de Empleo"
            width={1478}
            height={135}
            priority
            className="w-full h-auto"
          />
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-clash), system-ui' }}
        >
          Financiación europea
        </h1>
        <p className="text-base text-white/60 leading-relaxed mb-10">
          La puesta en marcha de ProfimaxIA ha sido <strong className="text-white">cofinanciada por la Unión Europea</strong> a
          través del Fondo Social Europeo Plus (FSE+), dentro del Programa Cantabria FSE+ 2021-2027, mediante la
          subvención a la promoción del empleo autónomo concedida por el Servicio Cántabro de Empleo.
        </p>

        <dl className="grid sm:grid-cols-2 gap-px rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.08] mb-10">
          {DATOS.map((d) => (
            <div key={d.k} className="bg-[#0b0b16] px-5 py-4">
              <dt className="text-[11px] uppercase tracking-wider text-[#E07B2E] font-semibold mb-1">{d.k}</dt>
              <dd className="text-sm text-white/85 leading-relaxed">{d.v}</dd>
            </div>
          ))}
        </dl>

        <section className="space-y-6 text-sm text-white/60 leading-relaxed">
          <div>
            <h2 className="text-white font-semibold mb-1.5">Descripción</h2>
            <p>
              Subvenciones a la promoción del empleo autónomo joven incentivando el alta de personas emprendedoras en
              desempleo en el Régimen Especial de Trabajadores por Cuenta Propia o Autónomos de la Seguridad Social, o
              cualquier otro régimen especial por cuenta propia de la Seguridad Social o en mutualidad de colegio
              profesional.
            </p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-1.5">Objetivo principal</h2>
            <p>Esta operación tiene como objeto incentivar el alta de personas jóvenes emprendedoras.</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-1.5">Resultado</h2>
            <p>
              Alta en el Régimen Especial de Trabajadores Autónomos el 21 de julio de 2025 y puesta en marcha de
              ProfimaxIA, estudio de desarrollo de software a medida, automatización e inteligencia artificial para
              empresas.
            </p>
          </div>
        </section>

        <p className="text-xs text-white/30 mt-12 pt-6 border-t border-white/[0.06]">
          Más información sobre las ayudas en{' '}
          <a
            href="https://www.empleacantabria.es/ayudas-y-subvenciones"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition-colors duration-300"
          >
            empleacantabria.es
          </a>
          .
        </p>
      </div>
    </main>
  )
}
