export interface Category {
    id: string
    name: string
    color: string
    icon: string
}
  
export interface TimeEntry {
    id: string
    title: string
    categoryId: string | null
    startTime: string
    endTime: string | null
    duration: number | null
    category?: Category
}