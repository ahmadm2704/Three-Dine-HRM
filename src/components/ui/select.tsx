"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
        className
      )}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
  </div>
))
Select.displayName = "Select"

const SelectTrigger = Select
const SelectValue = ({ placeholder }: { placeholder?: string }) => null
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => (
  <option ref={ref} {...props}>{children}</option>
))
SelectItem.displayName = "SelectItem"
const SelectGroup = ({ children }: { children: React.ReactNode }) => <optgroup>{children}</optgroup>
const SelectLabel = ({ children }: { children: React.ReactNode }) => <option disabled>{children}</option>
const SelectSeparator = () => null

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
}
