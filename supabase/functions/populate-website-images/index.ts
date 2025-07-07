import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pre-defined business/product images for the website
const websiteImagePrompts = [
  {
    key: 'business-hero',
    prompt: 'Professional business team collaborating in modern office, diverse professionals, laptop screens showing charts and data, bright modern workspace, corporate photography style, high quality, realistic'
  },
  {
    key: 'financial-dashboard',
    prompt: 'Modern financial dashboard on computer screen, clean UI design, charts and graphs, financial data visualization, professional business analytics interface, blue and white color scheme'
  },
  {
    key: 'business-meeting',
    prompt: 'Business professionals in meeting room, presentation on large screen, modern conference room, professional attire, collaborative discussion, corporate environment'
  },
  {
    key: 'education-concept',
    prompt: 'Digital learning concept, laptop with educational content, books and charts, knowledge visualization, professional education materials, modern learning environment'
  },
  {
    key: 'success-growth',
    prompt: 'Business growth concept, upward trending arrow, success metrics, professional infographic style, clean modern design, achievement visualization'
  },
  {
    key: 'team-collaboration',
    prompt: 'Diverse business team working together, brainstorming session, sticky notes and charts, modern office space, collaborative workspace, professional environment'
  },
  {
    key: 'investment-strategy',
    prompt: 'Investment portfolio visualization, financial charts and graphs, market analysis on screens, professional trading setup, clean modern interface design'
  },
  {
    key: 'business-presentation',
    prompt: 'Professional giving business presentation, large screen with charts, modern conference room, audience engagement, corporate training environment'
  },
  {
    key: 'digital-transformation',
    prompt: 'Digital business transformation concept, technology integration, modern workplace, digital tools and interfaces, professional business setting'
  },
  {
    key: 'leadership-concept',
    prompt: 'Business leadership concept, professional in modern office, strategic planning materials, executive workspace, leadership visualization'
  }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { imageKey, regenerate = false } = await req.json()

    // If specific image requested
    if (imageKey) {
      const imagePrompt = websiteImagePrompts.find(p => p.key === imageKey)
      if (!imagePrompt) {
        throw new Error('Image key not found')
      }

      const generatedImage = await generateImage(imagePrompt.prompt, openaiKey)
      
      return new Response(
        JSON.stringify({ 
          success: true,
          imageKey: imagePrompt.key,
          imageUrl: generatedImage,
          message: `Generated image for ${imagePrompt.key}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate all images
    const results = []
    for (const imagePrompt of websiteImagePrompts) {
      try {
        console.log(`Generating ${imagePrompt.key}...`)
        const imageUrl = await generateImage(imagePrompt.prompt, openaiKey)
        
        results.push({
          key: imagePrompt.key,
          imageUrl,
          success: true
        })
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Failed to generate ${imagePrompt.key}:`, error)
        results.push({
          key: imagePrompt.key,
          error: error.message,
          success: false
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        total: websiteImagePrompts.length,
        successful: results.filter(r => r.success).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in populate-website-images:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function generateImage(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'high',
      output_format: 'png'
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to generate image')
  }

  const result = await response.json()
  return result.data[0].url
}