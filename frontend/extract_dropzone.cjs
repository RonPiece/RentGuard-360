const fs = require('fs');

const fileSrc = 'src/pages/core/UploadPage.jsx';
let content = fs.readFileSync(fileSrc, 'utf8');

const dropZoneRegex = /<div\s+className={`lp-dropzone[^>]*>[\s\S]*?<div className="lp-upload-icon-wrapper">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const match = content.match(dropZoneRegex);

if (match) {
    const importStatement = `import FileDropZone from '../../components/ui/FileDropZone';\n`;
    
    // Add import
    content = content.replace(
        /import \{ useLanguage \} from '\.\.\/\.\.\/contexts\/LanguageContext';/,
        `import { useLanguage } from '../../contexts/LanguageContext';\n${importStatement}`
    );

    // Replace component usage
    const usage = `<FileDropZone 
                            isDragging={isDragging} 
                            handleDragEnter={handleDragEnter} 
                            handleDragLeave={handleDragLeave} 
                            handleDragOver={handleDragOver} 
                            handleDrop={handleDrop} 
                            fileInputRef={fileInputRef} 
                            canChooseFile={canChooseFile} 
                            blockReason={blockReason} 
                        />`;
    
    content = content.replace(dropZoneRegex, usage);
    
    fs.writeFileSync(fileSrc, content);
    console.log('UploadPage.jsx updated successfully.');
} else {
    console.log('Could not find the DropZone div in UploadPage.jsx');
}
