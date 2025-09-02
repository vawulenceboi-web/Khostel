// Utility functions for real-time timestamps

export function calculateTimeAgo(dateString: string): string {
  if (!dateString) return 'Unknown'
  
  try {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
    return `${Math.floor(diffInSeconds / 31536000)}y ago`
  } catch (error) {
    return 'Unknown'
  }
}

export function isWithinLast24Hours(dateString: string): boolean {
  if (!dateString) return false
  
  try {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 24
  } catch (error) {
    return false
  }
}

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Unknown time'
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    // Just posted
    if (diffInSeconds < 10) return 'Just posted'
    
    // Seconds
    if (diffInSeconds < 60) return `Posted ${diffInSeconds} seconds ago`
    
    // Minutes
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `Posted ${minutes} minute${minutes > 1 ? 's' : ''} ago`
    }
    
    // Hours
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `Posted ${hours} hour${hours > 1 ? 's' : ''} ago`
    }
    
    // Days
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `Posted ${days} day${days > 1 ? 's' : ''} ago`
    }
    
    // Months
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return `Posted ${months} month${months > 1 ? 's' : ''} ago`
    }
    
    // Years
    const years = Math.floor(diffInSeconds / 31536000)
    return `Posted ${years} year${years > 1 ? 's' : ''} ago`
    
  } catch (error) {
    return 'Posted recently'
  }
}