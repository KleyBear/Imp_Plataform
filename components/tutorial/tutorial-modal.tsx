"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TutorialStep {
  title: string
  description: string
  details: string[]
}

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  steps: TutorialStep[]
}

export function TutorialModal({ isOpen, onClose, title, steps }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!steps || steps.length === 0) {
    return null
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Paso {currentStep + 1} de {steps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-2">{step?.title}</h3>
            <p className="text-blue-800">{step?.description}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {step?.details?.map((detail, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span className="text-slate-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep ? "bg-blue-600 w-8" : "bg-blue-300"
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleNext} className="gap-2">
              {currentStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
