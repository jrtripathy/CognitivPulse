'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Edit, Eye } from 'lucide-react'

interface PageElement {
  id: string
  type: 'header' | 'text' | 'image' | 'button' | 'form'
  content: any
  styles: any
}

interface PageBuilderProps {
  pageData: {
    elements: PageElement[]
    styles: any
  }
  onChange: (data: any) => void
}

export function PageBuilder({ pageData, onChange }: PageBuilderProps) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const elementTypes = [
    { type: 'header', label: 'Header', icon: '📝' },
    { type: 'text', label: 'Text Block', icon: '📄' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'button', label: 'Button', icon: '🔘' },
    { type: 'form', label: 'Form', icon: '📋' }
  ]

  const addElement = (type: string) => {
    const newElement: PageElement = {
      id: `element-${Date.now()}`,
      type: type as any,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type)
    }

    onChange({
      ...pageData,
      elements: [...pageData.elements, newElement]
    })
  }

  const updateElement = (id: string, updates: Partial<PageElement>) => {
    const updatedElements = pageData.elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    )

    onChange({
      ...pageData,
      elements: updatedElements
    })
  }

  const deleteElement = (id: string) => {
    const filteredElements = pageData.elements.filter(el => el.id !== id)
    onChange({
      ...pageData,
      elements: filteredElements
    })
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(pageData.elements)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onChange({
      ...pageData,
      elements: items
    })
  }

  if (previewMode) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Preview</h2>
          <Button onClick={() => setPreviewMode(false)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
        <div className="bg-white min-h-screen">
          {pageData.elements.map((element) => (
            <ElementRenderer key={element.id} element={element} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-screen">
      {/* Element Library */}
      <div className="col-span-2 bg-gray-50 p-4">
        <h3 className="font-semibold mb-4">Elements</h3>
        <div className="space-y-2">
          {elementTypes.map((elementType) => (
            <Button
              key={elementType.type}
              variant="outline"
              className="w-full justify-start"
              onClick={() => addElement(elementType.type)}
            >
              <span className="mr-2">{elementType.icon}</span>
              {elementType.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="col-span-7 bg-white overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Page Builder</h2>
          <Button onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="canvas">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-h-[600px] p-4"
              >
                {pageData.elements.map((element, index) => (
                  <Draggable key={element.id} draggableId={element.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-4 relative group ${
                          selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        <ElementRenderer element={element} />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex space-x-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteElement(element.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Properties Panel */}
      <div className="col-span-3 bg-gray-50 p-4">
        <h3 className="font-semibold mb-4">Properties</h3>
        {selectedElement && (
          <ElementProperties
            element={pageData.elements.find(el => el.id === selectedElement)!}
            onUpdate={(updates) => updateElement(selectedElement, updates)}
          />
        )}
      </div>
    </div>
  )
}

function ElementRenderer({ element }: { element: PageElement }) {
  switch (element.type) {
    case 'header':
      return (
        <h1 style={element.styles} className="text-3xl font-bold">
          {element.content.text}
        </h1>
      )
    case 'text':
      return (
        <p style={element.styles} className="text-gray-700">
          {element.content.text}
        </p>
      )
    case 'image':
      return (
        <img
          src={element.content.src || 'https://via.placeholder.com/400x200'}
          alt={element.content.alt}
          style={element.styles}
          className="max-w-full h-auto"
        />
      )
    case 'button':
      return (
        <button style={element.styles} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {element.content.text}
        </button>
      )
    case 'form':
      return (
        <form style={element.styles} className="space-y-4 max-w-md">
          {element.content.fields.map((field: any, index: number) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          ))}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
            {element.content.submitText}
          </button>
        </form>
      )
    default:
      return <div>Unknown element type</div>
  }
}

function ElementProperties({ element, onUpdate }: { element: PageElement; onUpdate: (updates: any) => void }) {
  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: {
        ...element.content,
        [key]: value
      }
    })
  }

  const updateStyles = (key: string, value: any) => {
    onUpdate({
      styles: {
        ...element.styles,
        [key]: value
      }
    })
  }

  return (
    <div className="space-y-4">
      {element.type === 'header' && (
        <>
          <div>
            <Label>Text</Label>
            <Input
              value={element.content.text}
              onChange={(e) => updateContent('text', e.target.value)}
            />
          </div>
          <div>
            <Label>Color</Label>
            <Input
              type="color"
              value={element.styles.color || '#000000'}
              onChange={(e) => updateStyles('color', e.target.value)}
            />
          </div>
        </>
      )}

      {element.type === 'text' && (
        <>
          <div>
            <Label>Text</Label>
            <Textarea
              value={element.content.text}
              onChange={(e) => updateContent('text', e.target.value)}
            />
          </div>
          <div>
            <Label>Font Size</Label>
            <Input
              type="number"
              value={parseInt(element.styles.fontSize) || 16}
              onChange={(e) => updateStyles('fontSize', `${e.target.value}px`)}
            />
          </div>
        </>
      )}

      {element.type === 'button' && (
        <>
          <div>
            <Label>Button Text</Label>
            <Input
              value={element.content.text}
              onChange={(e) => updateContent('text', e.target.value)}
            />
          </div>
          <div>
            <Label>Background Color</Label>
            <Input
              type="color"
              value={element.styles.backgroundColor || '#3b82f6'}
              onChange={(e) => updateStyles('backgroundColor', e.target.value)}
            />
          </div>
          <div>
            <Label>Link URL</Label>
            <Input
              value={element.content.href || ''}
              onChange={(e) => updateContent('href', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </>
      )}
    </div>
  )
}

function getDefaultContent(type: string) {
  switch (type) {
    case 'header':
      return { text: 'Your Heading Here' }
    case 'text':
      return { text: 'Add your text content here. You can edit this in the properties panel.' }
    case 'image':
      return { src: '', alt: 'Image description' }
    case 'button':
      return { text: 'Click Me', href: '#' }
    case 'form':
      return {
        fields: [
          { type: 'text', label: 'Name', placeholder: 'Enter your name' },
          { type: 'email', label: 'Email', placeholder: 'Enter your email' }
        ],
        submitText: 'Submit'
      }
    default:
      return {}
  }
}

function getDefaultStyles(type: string) {
  switch (type) {
    case 'header':
      return { color: '#1f2937', marginBottom: '16px' }
    case 'text':
      return { fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }
    case 'image':
      return { width: '100%', height: 'auto', marginBottom: '16px' }
    case 'button':
      return { 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        padding: '12px 24px', 
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        marginBottom: '16px'
      }
    case 'form':
      return { marginBottom: '24px' }
    default:
      return {}
  }
}