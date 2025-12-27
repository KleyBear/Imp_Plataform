"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, BarChart3, Award, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Extensión Universitaria Táchira</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" className="border-white text-white hover:bg-blue-700 bg-transparent">
                Inicia Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">Regístrate</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6 leading-tight">Plataforma Educativa de Clase Mundial</h2>
              <p className="text-lg mb-8 text-blue-100">
                Accede a cursos de excelencia de la Extensión Universitaria Táchira. Aprende de expertos y obtén
                certificaciones reconocidas.
              </p>
              <div className="flex gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Comenzar Ahora <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-blue-700 bg-transparent"
                  >
                    Ver Cursos
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur rounded-lg p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-yellow-300" />
                    <span>Certificación Oficial</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-yellow-300" />
                    <span>Comunidad Activa</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-300" />
                    <span>Aprendizaje Flexible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">¿Por qué elegirnos?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2 text-gray-900">Dashboards Inteligentes</h4>
              <p className="text-gray-600">
                Monitoreo en tiempo real de tu progreso académico con analíticas detalladas.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2 text-gray-900">Plataforma Segura</h4>
              <p className="text-gray-600">
                Tu información académica protegida con los más altos estándares de seguridad.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
              <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-bold mb-2 text-gray-900">Crecimiento Académico</h4>
              <p className="text-gray-600">
                Desarrolla tus habilidades con cursos diseñados por expertos universitarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-6">¿Listo para transformar tu educación?</h3>
          <p className="text-lg mb-8 text-blue-100">
            Únete a miles de estudiantes exitosos de la Extensión Universitaria Táchira
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Registrarse Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Extensión Universitaria Táchira. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
