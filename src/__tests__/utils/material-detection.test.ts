import {
    CommonMaterials,
    areRecyclingCompatible,
    detectMaterial,
    getRecyclingInstructions
} from '@/utils/material-detection';

// Mock the ar-helpers import
jest.mock('@/utils/ar-helpers', () => ({
  containerTypes: [
    {
      id: 'pet-bottle',
      name: 'Plastic Bottle (PET)',
      material: 'Polyethylene terephthalate (PET)',
      isRecyclable: true
    },
    {
      id: 'hdpe-container',
      name: 'HDPE Container',
      material: 'High-density polyethylene (HDPE)',
      isRecyclable: true
    },
    {
      id: 'aluminum-can',
      name: 'Aluminum Can',
      material: 'Aluminum',
      isRecyclable: true
    }
  ]
}));

describe('Material Detection Utils', () => {
  describe('detectMaterial', () => {
    beforeEach(() => {
      // Reset Math.random to make tests deterministic
      jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
      // Restore Math.random
      jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('should detect material from image data', async () => {
      const mockImageData = { /* mock image data */ };
      
      const result = await detectMaterial(mockImageData);
      
      // Verify structure of the result
      expect(result).toHaveProperty('materialType');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('recyclingInfo');
      expect(result).toHaveProperty('properties');
      
      // Confidence should be between 0 and 1
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should use container type to improve detection accuracy', async () => {
      const mockImageData = { /* mock image data */ };
      
      // Test with a known container type
      const result = await detectMaterial(mockImageData, 'pet-bottle');
      
      expect(result.materialType).toBe(CommonMaterials.PET);
      expect(result.confidence).toBeGreaterThan(0.8); // Higher confidence with known type
    });

    it('should provide recycling information', async () => {
      const mockImageData = { /* mock image data */ };
      
      const result = await detectMaterial(mockImageData, 'aluminum-can');
      
      expect(result.materialType).toBe(CommonMaterials.ALUMINUM);
      expect(result.recyclingInfo.isRecyclable).toBe(true);
      expect(result.recyclingInfo).toHaveProperty('specialInstructions');
    });
  });

  describe('areRecyclingCompatible', () => {
    it('should correctly identify compatible materials', () => {
      // Same material should be compatible
      expect(areRecyclingCompatible(CommonMaterials.PET, CommonMaterials.PET)).toBe(true);
      
      // Metals can be recycled together
      expect(areRecyclingCompatible(CommonMaterials.ALUMINUM, CommonMaterials.STEEL)).toBe(true);
      
      // Paper products can be recycled together
      expect(areRecyclingCompatible(CommonMaterials.PAPER, CommonMaterials.CARDBOARD)).toBe(true);
    });

    it('should correctly identify incompatible materials', () => {
      // Different plastics are typically not recycled together
      expect(areRecyclingCompatible(CommonMaterials.PET, CommonMaterials.HDPE)).toBe(false);
      
      // Plastic and glass are not recycled together
      expect(areRecyclingCompatible(CommonMaterials.PET, CommonMaterials.GLASS)).toBe(false);
      
      // Paper and aluminum are not recycled together
      expect(areRecyclingCompatible(CommonMaterials.PAPER, CommonMaterials.ALUMINUM)).toBe(false);
    });
  });

  describe('getRecyclingInstructions', () => {
    it('should return specific instructions for each material', () => {
      // Test PET instructions
      const petInstructions = getRecyclingInstructions(CommonMaterials.PET);
      expect(petInstructions).toContain('Clean and rinse');
      expect(petInstructions).toContain('caps or lids');
      
      // Test Aluminum instructions
      const aluminumInstructions = getRecyclingInstructions(CommonMaterials.ALUMINUM);
      expect(aluminumInstructions).toContain('Rinse clean');
      expect(aluminumInstructions).toContain('crushed');
      
      // Test Paper instructions
      const paperInstructions = getRecyclingInstructions(CommonMaterials.PAPER);
      expect(paperInstructions).toContain('Keep dry');
    });

    it('should return fallback instructions for unknown materials', () => {
      const unknownInstructions = getRecyclingInstructions(CommonMaterials.UNKNOWN);
      expect(unknownInstructions).toContain('check local guidelines');
    });
  });
}); 