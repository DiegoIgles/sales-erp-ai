'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function TestModalPage() {
  return (
    <div className="p-10">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Abrir modal</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test de modal</DialogTitle>
            <DialogDescription>Este modal debería abrirse correctamente</DialogDescription>
          </DialogHeader>
          <p>Contenido de prueba</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
