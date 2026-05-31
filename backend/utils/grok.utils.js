export const groqcalling = async (systemPrompt, userQuestion) => {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.groq}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userQuestion,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);
      throw new Error(
        `Groq API failed: ${errorData.error?.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;
    return assistantResponse;
  } catch (error) {
    console.error("Error in groqcalling:", error);
    throw error;
  }
};
