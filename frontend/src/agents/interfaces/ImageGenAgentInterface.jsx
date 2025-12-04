import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineCamera, AiOutlinePicture, AiOutlineUpload, AiOutlineFire } from 'react-icons/ai';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ImageGenAgentInterface = ({ agent, onRun }) => {
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReferenceImage(file);
      setError(null);
    }
  };

  const handleImageDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setReferenceImage(file);
      setError(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleImageDragOver = (event) => {
    event.preventDefault();
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
  };

  const handleRun = async () => {
    if (!prompt.trim()) {
      setError('Please enter an image description');
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const runData = {
        prompt: prompt.trim(),
        reference_image: referenceImage ? referenceImage.name : null
      };

      const response = await onRun(runData);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const formatImageResult = (result) => {
    if (!result || !result.output) return null;

    const data = result.output;
    if (!data.success) {
      return (
        <div className="text-center text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Generation Failed</h3>
          <p className="text-[var(--text)]">{data.error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Generated Images */}
        {data.result?.images && data.result.images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
              <AiOutlinePicture className="w-5 h-5" />
              Generated Images
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {data.result.images.map((image, index) => (
                <motion.div
                  key={index}
                  className="bg-[var(--surface)] rounded-lg overflow-hidden border border-[var(--muted)]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/512x512?text=Image+Generation+Failed';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {image.size}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-[var(--muted)]">Image #{index + 1}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          View Full
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = image.url;
                            link.download = `generated-image-${index + 1}.png`;
                            link.click();
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Image Specification */}
        {data.image_spec && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineFire className="w-5 h-5" />
              Image Specification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-[var(--text)] mb-2">Enhanced Prompt</h4>
                  <p className="text-sm text-[var(--muted)] bg-[var(--bg)] p-3 rounded border">
                    {data.image_spec.enhanced_prompt}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[var(--text)] mb-2">Style</h4>
                  <p className="text-sm text-[var(--muted)] bg-[var(--bg)] p-3 rounded border">
                    {data.image_spec.style}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-[var(--text)] mb-2">Composition</h4>
                  <p className="text-sm text-[var(--muted)] bg-[var(--bg)] p-3 rounded border">
                    {data.image_spec.composition}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[var(--text)] mb-2">Colors</h4>
                  <p className="text-sm text-[var(--muted)] bg-[var(--bg)] p-3 rounded border">
                    {data.image_spec.colors}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--muted)]">
              <h4 className="font-medium text-[var(--text)] mb-2">Technical Details</h4>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                <span>Resolution: {data.image_spec.technical.resolution}</span>
                <span>Aspect Ratio: {data.image_spec.technical.aspect_ratio}</span>
                <span>Format: {data.image_spec.technical.format}</span>
              </div>
            </div>
          </div>
        )}

        {/* Generation Stats */}
        {data.result && (
          <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--muted)]">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <AiOutlineCamera className="w-5 h-5" />
              Generation Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text)]">{data.result.processing_time}</div>
                <div className="text-sm text-[var(--muted)]">Processing Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text)]">{data.result.api_used}</div>
                <div className="text-sm text-[var(--muted)]">API Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--text)]">{data.result.credits_used}</div>
                <div className="text-sm text-[var(--muted)]">Credits Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{data.result.status}</div>
                <div className="text-sm text-[var(--muted)]">Status</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Panel */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-primary to-orange-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2 flex items-center gap-3">
            <AiOutlineCamera className="w-7 h-7 text-primary" />
            Run {agent.name}
          </h2>
          <p className="text-[var(--text)] text-sm opacity-80">
            Describe your vision and watch AI bring it to life
          </p>
        </div>

        {/* Prompt Input */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Image Description"
              placeholder="Describe the image you want to create in detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-32"
              as="textarea"
            />
            <div className="absolute bottom-3 right-3 text-xs text-[var(--muted)]">
              {prompt.length}/1000
            </div>
          </div>

          {/* Reference Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--text)]">
              Reference Image (Optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
                referenceImage
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'border-[var(--muted)] hover:border-primary hover:bg-primary/5'
              }`}
              onDrop={handleImageDrop}
              onDragOver={handleImageDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {referenceImage ? (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(referenceImage)}
                      alt="Reference"
                      className="w-20 h-20 object-cover rounded-lg border border-[var(--muted)]"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeReferenceImage();
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{referenceImage.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {(referenceImage.size / 1024).toFixed(1)} KB • Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <AiOutlineUpload className="w-10 h-10 text-[var(--muted)] mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">Add reference image</p>
                    <p className="text-xs text-[var(--muted)]">
                      Drop an image here or click to browse • PNG, JPG, WebP up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Style Suggestions */}
          <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--muted)]">
            <h3 className="font-semibold text-[var(--text)] mb-3">Style Suggestions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {[
                'Realistic', 'Artistic', 'Cartoon', 'Minimalist', 'Vintage',
                'Futuristic', 'Abstract', 'Photography', 'Illustration', '3D Render'
              ].map((style) => (
                <button
                  key={style}
                  onClick={() => setPrompt(prev => prev ? `${prev}, ${style} style` : `${style} style`)}
                  className="p-2 bg-[var(--bg)] hover:bg-primary/10 hover:text-primary rounded border border-[var(--muted)] transition-colors text-[var(--text)]"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleRun}
              loading={running}
              disabled={!prompt.trim() || running}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {running ? (
                <div className="flex items-center gap-3">
                  <AiOutlineCamera className="w-5 h-5 animate-spin" />
                  <span>Generating your image...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <AiOutlineCamera className="w-5 h-5" />
                  <span>Generate Image</span>
                </div>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Output Panel */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
            <AiOutlinePicture className="w-7 h-7 text-primary" />
            Generated Images
          </h2>
        </div>

        <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] rounded-xl p-6 min-h-96 border border-primary/10 shadow-lg overflow-y-auto">
          {running ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <AiOutlineCamera className="w-16 h-16 text-primary" />
              </motion.div>
              <div className="text-center">
                <div className="text-lg font-semibold text-[var(--text)] mb-2">
                  Creating your masterpiece...
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                </div>
                <p className="text-sm text-[var(--muted)] text-center">
                  AI is crafting your image with advanced algorithms
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Generation Failed</h3>
              <p className="text-[var(--text)] mb-4">{error}</p>
              <Button onClick={handleRun} variant="outline">
                Try Again
              </Button>
            </div>
          ) : result ? (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                  <AiOutlineCamera className="w-4 h-4" />
                  <span className="font-semibold">Image Generated Successfully</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your AI-generated image is ready for download
                </p>
              </div>
              {formatImageResult(result)}
            </motion.div>
          ) : (
            <div className="text-center text-[var(--muted)] flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-4"
              >
                <AiOutlinePicture className="w-20 h-20 text-primary/50" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--text)]">
                Ready to Create
              </h3>
              <p className="text-lg mb-4 max-w-sm">
                Describe any image you can imagine and watch as AI transforms your words into stunning visuals
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  🎨 AI-Powered
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  ⚡ Fast Generation
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  🖼️ High Quality
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ImageGenAgentInterface;