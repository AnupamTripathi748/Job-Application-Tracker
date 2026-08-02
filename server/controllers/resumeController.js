import { PDFParse } from 'pdf-parse';
import { GoogleGenAI, Type } from '@google/genai';

export const checkResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'Please select a PDF resume file to upload.' });
  }

  // Validate PDF extension and mimetype
  const originalName = req.file.originalname || '';
  if (!originalName.toLowerCase().endsWith('.pdf') && req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ msg: 'Invalid file format. Only PDF files are supported.' });
  }

  // Parse text from PDF buffer using PDFParse
  let extractedText = '';
  try {
    const parser = new PDFParse({ data: req.file.buffer });
    const textResult = await parser.getText();
    extractedText = textResult && textResult.text ? textResult.text.trim() : '';
    if (typeof parser.destroy === 'function') {
      await parser.destroy();
    }
  } catch (err) {
    console.error('PDF parsing error:', err);
    return res.status(400).json({
      msg: 'Failed to extract text from PDF file. Please ensure it is a valid, unencrypted PDF.',
    });
  }

  if (!extractedText || extractedText.length < 30) {
    return res.status(400).json({
      msg: 'No readable text could be extracted from this PDF. If your resume is an image or scan, please upload a text-based PDF.',
    });
  }

  // Limit text length to avoid token overflow while keeping full detail
  const cleanText = extractedText.replace(/\s+/g, ' ').slice(0, 15000);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('MY_GEMINI_API_KEY') || apiKey.includes('YOUR_GEMINI_API_KEY')) {
    return res.status(500).json({
      msg: 'Gemini API key is missing or invalid on the server. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Analyze the following software engineering / tech candidate resume text extracted from a PDF document.
Evaluate its structure, ATS (Applicant Tracking System) friendliness, technical/soft skills, impact metrics, formatting, and overall competitiveness.

EXTRACTED RESUME TEXT:
"""
${cleanText}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert ATS auditor and lead technical recruiter. You evaluate resumes with precision, offering constructive feedback, actionable improvements, and realistic scoring based on industry standards.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.NUMBER,
              description: 'Overall resume quality score from 0 to 100',
            },
            atsScore: {
              type: Type.NUMBER,
              description: 'ATS readability and keyword compatibility score from 0 to 100',
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key strengths, impressive metrics, or standout achievements found in the resume',
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Areas where the resume falls short or lacks impact',
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Important missing skills, industry tools, or role keywords',
            },
            improvementSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable recommendations to improve formatting, impact metrics, and wording',
            },
            summary: {
              type: Type.STRING,
              description: 'A brief 2-3 sentence overall summary feedback',
            },
          },
          required: [
            'overallScore',
            'atsScore',
            'strengths',
            'weaknesses',
            'missingSkills',
            'improvementSuggestions',
            'summary',
          ],
        },
      },
    });

    let jsonString = response.text ? response.text.trim() : '';
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    if (!jsonString) {
      return res.status(500).json({ msg: 'No response data received from AI analyzer.' });
    }
    let analysis;
    try {
      analysis = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error('JSON parse error on Gemini response:', parseErr, jsonString);
      return res.status(500).json({ msg: 'Failed to parse AI evaluation response.' });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error('Gemini Resume Analysis Error:', error);
    return res.status(500).json({
      msg: 'AI analysis failed: ' + (error.message || 'Error communicating with Gemini API'),
    });
  }
};
