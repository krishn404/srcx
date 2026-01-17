"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, X, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: readonly string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((item) => item !== option))
  }

  // Close dropdown when clicking outside
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <div
        className={cn(
          "h-12 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm",
          "flex items-center cursor-pointer transition-colors duration-200",
          "hover:border-foreground/30 overflow-hidden",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring/20 focus-within:ring-offset-0",
          isOpen && "ring-2 ring-ring/20 ring-offset-0"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-hide min-w-0">
          {selected.length === 0 ? (
            <span className="text-muted-foreground whitespace-nowrap">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1.5 flex-nowrap">
            {selected.map((option) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant="secondary"
                  className="text-xs shrink-0"
                  onClick={(e) => removeOption(option, e)}
                >
                  {option}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        e.stopPropagation()
                        onChange(selected.filter((item) => item !== option))
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => removeOption(option, e)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              </motion.div>
            ))}
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="ml-2 flex-shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-20 w-full mt-1 rounded-md border border-border bg-background shadow-lg backdrop-blur-sm"
            >
              <div className="max-h-60 overflow-auto p-1">
                {options.map((option, index) => (
                  <motion.div
                    key={option}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                      "transition-colors duration-150",
                      selected.includes(option) ? "bg-accent/50 hover:bg-accent hover:text-foreground" : "hover:bg-accent hover:text-foreground"
                    )}
                    onClick={() => toggleOption(option)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <motion.div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border transition-all duration-200",
                          selected.includes(option)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-primary/30"
                        )}
                        animate={{
                          scale: selected.includes(option) ? 1 : 0.9,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {selected.includes(option) && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <Check className="h-3 w-3" />
                          </motion.div>
                        )}
                      </motion.div>
                      <span>{option}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

