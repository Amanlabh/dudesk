import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { readFileSync } from "fs";

export async function POST(req: Request) {
  const { messages, theme, username } = await req.json();

  // Define system-level instructions for CUET Eligibility
  let systemMessage = `You are a helpful assistant that determines CUET course eligibility based on exam attempts.
    Be concise and provide a quick response. Focus on the essential details to determine eligibility.
    Avoid unnecessary elaboration.

    Key instructions:
    1. Understand CUET (Common University Entrance Test) eligibility criteria and how the number of attempts influences it.
    2. Provide quick, accurate eligibility assessments.
    3. Do not answer like you are getting this data from which path like list.s.
    4. If a file is uploaded, analyze its content for any relevant eligibility-related data.

    The user interface is currently in ${theme} mode. Adjust your language to be appropriate for the time of day implied by this setting (e.g., "Good evening" for dark mode, "Good day" for light mode) when greeting the user.

    The current user's username is ${username}. Use this information to personalize your responses when appropriate.`;

  // If files are uploaded, add instructions to analyze their content
  systemMessage += `\n\nA file has been uploaded. The file name is cuet_data.csv. Please analyze the contents of this file and always incorporate relevant information into your responses.`;
  systemMessage += `\n\nA file has been uploaded. The file name is links.csv. In your responses, in addition to the CUET criteria, please also add links to relevant resources that can help the user understand the criteria and make informed decisions.`;
  systemMessage += `\n\nA file has been uploaded. The file name is list.csv. In your responses, in addition to the CUET criteria, please also analyze within this list resources that can help the user understand the criteria and make informed decisions.`;
  systemMessage += `\n\nA file has been uploaded. The file name is cuet_updates.csv. In your responses, go thorugh this data before giving answers that is not in the data.`;

  // API key (use environment variable in production)
  const gemini_token = "AIzaSyA5cy_rQPePGwriEQZ-RHhCuZDULebrwY0";

  const google = createGoogleGenerativeAI({
    apiKey: gemini_token,
  });

  const github =
    "https://raw.githubusercontent.com/Amanlabh/dudesk/refs/heads/main/";

  const result = streamText({
    model: google("gemini-1.5-pro-latest"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: github + "cuet_data.csv",
            mimeType: "text/csv",
          },
          {
            type: "file",
            data: github + "links.csv",
            mimeType: "text/csv",
          },
          {
            type: "file",
            data: github + "list.csv",
            mimeType: "text/csv",
          },
        ],
      },
      ...messages,
    ],
    system: systemMessage,
  });

  return result.toDataStreamResponse();
}
