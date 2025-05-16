"use client"

export function toast({ title, description, variant = "default" }) {
  // Create a toast element
  const toastElement = document.createElement("div")
  toastElement.className = `fixed top-4 right-4 p-4 rounded-md shadow-md max-w-sm z-50 ${
    variant === "destructive" ? "bg-red-500 text-white" : "bg-white text-gray-900 border"
  }`

  // Create toast content
  const titleElement = document.createElement("div")
  titleElement.className = "font-semibold"
  titleElement.textContent = title

  const descriptionElement = document.createElement("div")
  descriptionElement.className = "text-sm mt-1"
  descriptionElement.textContent = description

  toastElement.appendChild(titleElement)
  toastElement.appendChild(descriptionElement)

  // Add to DOM
  document.body.appendChild(toastElement)

  // Remove after 3 seconds
  setTimeout(() => {
    toastElement.classList.add("opacity-0", "transition-opacity", "duration-300")
    setTimeout(() => {
      document.body.removeChild(toastElement)
    }, 300)
  }, 3000)
}
