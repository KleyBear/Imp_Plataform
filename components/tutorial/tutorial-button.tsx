"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

interface TutorialButtonProps {
  onClick: () => void
  label?: string
}

export function TutorialButton({ onClick, label = "Ver Tutorial" }: TutorialButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
    >
      <HelpCircle className="w-4 h-4" />
      {label}
    </Button>
  )
}
