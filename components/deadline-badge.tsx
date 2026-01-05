"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface DeadlineBadgeProps {
  deadline?: number | null // Unix timestamp
  className?: string
}

export function DeadlineBadge({ deadline, className }: DeadlineBadgeProps) {
  // Calculate days remaining and determine badge state
  const getBadgeState = () => {
    // Handle null, undefined, or invalid deadlines
    if (!deadline || typeof deadline !== "number" || isNaN(deadline)) {
      return {
        label: "Ongoing",
        variant: "yellow" as const,
        bgColor: "bg-amber-500",
        bgColorLight: "bg-amber-100",
        textColor: "text-amber-900",
        textColorDark: "dark:text-amber-100",
        dotColor: "bg-amber-600",
      }
    }

    const now = Date.now()
    const deadlineMs = deadline
    const daysRemaining = Math.ceil((deadlineMs - now) / (1000 * 60 * 60 * 24))

    // Past deadline
    if (daysRemaining < 0) {
      return {
        label: "Closed",
        variant: "gray" as const,
        bgColor: "bg-gray-500",
        bgColorLight: "bg-gray-100",
        textColor: "text-gray-900",
        textColorDark: "dark:text-gray-100",
        dotColor: "bg-gray-600",
      }
    }

    // Within 7 days (including today)
    if (daysRemaining <= 7) {
      return {
        label: "Ending Soon",
        variant: "red" as const,
        bgColor: "bg-red-500",
        bgColorLight: "bg-red-100",
        textColor: "text-red-900",
        textColorDark: "dark:text-red-100",
        dotColor: "bg-red-600",
      }
    }

    // More than 7 days
    return {
      label: "Active",
      variant: "green" as const,
      bgColor: "bg-green-500",
      bgColorLight: "bg-green-100",
      textColor: "text-green-900",
      textColorDark: "dark:text-green-100",
      dotColor: "bg-green-600",
    }
  }

  const badgeState = getBadgeState()
  const isRolling = !deadline || typeof deadline !== "number" || isNaN(deadline)

  const badgeContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="inline-block"
    >
      <Badge
        className={cn(
          "text-xs font-medium transition-colors border-transparent flex items-center gap-1.5",
          // Use light background for better contrast
          badgeState.bgColorLight,
          badgeState.textColor,
          badgeState.textColorDark,
          // Pulse animation for "Ending Soon" badges
          badgeState.variant === "red" && "animate-pulse",
          className
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            badgeState.dotColor,
            "animate-pulse"
          )}
          aria-hidden="true"
        />
        {badgeState.label}
      </Badge>
    </motion.div>
  )

  // For rolling deadlines, wrap in tooltip
  if (isRolling) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>This opportunity has a rolling deadline</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badgeContent
}

