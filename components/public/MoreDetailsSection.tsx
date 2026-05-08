"use client";

interface Field {
  id: string;
  label: string;
  type: string;
  value: string | null;
  isRequired: boolean;
}

interface MoreDetailsSectionProps {
  fields: Field[];
}

export function MoreDetailsSection({ fields }: MoreDetailsSectionProps) {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="mt-12 pt-12 border-t border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8">
        More details
      </h2>
      
      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-2">
              {field.isRequired && (
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" title="Required field" />
              )}
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {field.label}
              </h3>
            </div>
            
            <div className="text-gray-900 dark:text-gray-200">
              {field.type === "short_text" ? (
                <p className="text-base">{field.value}</p>
              ) : (
                <div 
                  className="text-base whitespace-pre-wrap leading-relaxed"
                  style={{ lineHeight: 1.6 }}
                >
                  {field.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
