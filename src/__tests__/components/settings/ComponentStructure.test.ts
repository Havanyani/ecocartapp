import fs from 'fs';
import path from 'path';

interface ComponentFile {
  name: string;
  path: string;
  content: string;
}

describe('Settings Component Structure', () => {
  const srcComponentsPath = path.resolve(__dirname, '../../../../src/components/ui');
  const appComponentsPath = path.resolve(__dirname, '../../../../app/components');
  const srcPath = path.resolve(__dirname, '../../../../src');
  const appPath = path.resolve(__dirname, '../../../../app');

  function findComponentFiles(dir: string): ComponentFile[] {
    const results: ComponentFile[] = [];
    if (!fs.existsSync(dir)) return results;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        results.push(...findComponentFiles(filePath));
      } else if (
        stat.isFile() && 
        (file.endsWith('.tsx') || file.endsWith('.ts'))
      ) {
        results.push({
          name: file,
          path: filePath,
          content: fs.readFileSync(filePath, 'utf8')
        });
      }
    });

    return results;
  }

  function findDuplicateFiles(): { [key: string]: ComponentFile[] } {
    const allFiles = [
      ...findComponentFiles(srcPath),
      ...findComponentFiles(appPath)
    ];

    const duplicates: { [key: string]: ComponentFile[] } = {};
    const fileMap = new Map<string, ComponentFile[]>();

    // Group files by name
    allFiles.forEach(file => {
      const existing = fileMap.get(file.name) || [];
      fileMap.set(file.name, [...existing, file]);
    });

    // Filter out files that appear more than once
    fileMap.forEach((files, fileName) => {
      if (files.length > 1) {
        duplicates[fileName] = files;
      }
    });

    return duplicates;
  }

  it('should not have duplicate components in app/ and src/', () => {
    const srcComponents = findComponentFiles(srcComponentsPath)
      .map(file => file.name);
    const appComponents = findComponentFiles(appComponentsPath)
      .map(file => file.name);

    const duplicates = srcComponents.filter(file => 
      appComponents.includes(file)
    );

    expect(duplicates).toEqual([]);
  });

  it('settings components should be in correct location', () => {
    const settingsComponents = findComponentFiles(srcComponentsPath)
      .filter(file => file.path.includes('settings'));

    settingsComponents.forEach(file => {
      expect(file.path).toContain('src/components/ui/settings');
    });
  });

  it('should have consistent component structure', () => {
    const settingsComponents = findComponentFiles(
      path.join(srcComponentsPath, 'ui', 'settings')
    );

    settingsComponents.forEach(file => {
      // Check for required imports
      expect(file.content).toContain('import { useTheme }');
      expect(file.content).toContain('import React');
      
      // Check for proper exports
      expect(file.content).toMatch(/export (default |{)/);
      
      // Check for proper styling
      expect(file.content).toContain('StyleSheet.create');
    });
  });

  it('should identify and report duplicate files', () => {
    const duplicates = findDuplicateFiles();
    const duplicateCount = Object.keys(duplicates).length;

    if (duplicateCount > 0) {
      console.log('\nDuplicate files found:');
      Object.entries(duplicates).forEach(([fileName, files]) => {
        console.log(`\n${fileName}:`);
        files.forEach(file => {
          console.log(`  - ${path.relative(process.cwd(), file.path)}`);
          
          // Compare content to help identify which is newer/better
          const contentHash = Buffer.from(file.content).toString('base64').slice(0, 8);
          const lineCount = file.content.split('\n').length;
          console.log(`    Content hash: ${contentHash}, Lines: ${lineCount}`);
        });
      });
    }

    // This test will fail if duplicates are found, prompting cleanup
    expect(duplicateCount).toBe(0);
  });
}); 