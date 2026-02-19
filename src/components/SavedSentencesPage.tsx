import { MouseEvent, useEffect, useState } from "react";
import axios from "axios";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

interface SavedSentence {
  _id: string;
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  wordsSavedCount: number;
  createdAt: string;
  responsePayload?: unknown;
}

export const SavedSentencesPage = () => {
  const [sentences, setSentences] = useState<SavedSentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSentences = async () => {
      try {
        setLoading(true);
        const res = await axios.get<SavedSentence[]>("/saved-sentences");
        setSentences(res.data);
      } catch (err) {
        console.error("Error fetching saved sentences:", err);
        setError("Failed to load saved sentences. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSentences();
  }, []);

  const handleDelete = async (
    e: MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    e.stopPropagation();
    try {
      await axios.delete(`/saved-sentences/${id}`);
      setSentences((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting saved sentence:", err);
      setError("Failed to delete sentence. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Saved Sentences
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Review your previously translated and saved sentences, along with
            how many words you turned into flashcards.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            <span>Loading saved sentences...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && sentences.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
            You haven't saved any sentences yet. Translate a sentence on the
            Translate page and it will appear here automatically.
          </div>
        )}

        {!loading && !error && sentences.length > 0 && (
          <div className="space-y-4">
            {sentences.map((sentence) => (
              <Card
                key={sentence._id}
                className="p-4 md:p-5 border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer"
                onClick={() => {
                  if (sentence.responsePayload) {
                    try {
                      localStorage.setItem(
                        "response",
                        JSON.stringify(sentence.responsePayload)
                      );
                    } catch (e) {
                      console.error("Failed to store response payload:", e);
                    }
                  }
                  localStorage.setItem("fromLanguage", sentence.fromLanguage);

                  navigate("/", {
                    state: {
                      fromSavedSentence: true,
                      originalText: sentence.originalText,
                      fromLanguage: sentence.fromLanguage
                    }
                  });
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500">
                      <Badge variant="outline">
                        {sentence.fromLanguage} → {sentence.toLanguage}
                      </Badge>
                      {sentence.createdAt && (
                        <span>
                          {new Date(sentence.createdAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm md:text-base text-gray-900 font-medium">
                      {sentence.originalText}
                    </p>
                    <p className="text-sm md:text-base text-gray-600 italic">
                      {sentence.translatedText}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-start md:items-end">
                        <span className="text-xs uppercase tracking-wide text-gray-500">
                          Words you have saved
                        </span>
                        <span className="text-lg font-semibold text-blue-600">
                          {sentence.wordsSavedCount ?? 0}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, sentence._id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Delete saved sentence"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};




