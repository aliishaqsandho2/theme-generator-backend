import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';
import admZip from 'adm-zip';

const prisma = new PrismaClient();

export const generateTheme = async (themeData: {
  basicInfo: {
    websiteName: string;
    websiteType: string;
    industry: string;
    targetAudience: string;
    businessDescription: string;
  };
  designPreferences: {
    designStyle: string;
    colorScheme: string | string[];
    selectedTheme: string | null;
    fontPairing: string | string[];
    brandColors: string | string[];
  };
  selectedFeatures: string[];
  layoutStructure: {
    layoutStyle: string;
    headerStyle: string;
    footerStyle: string;
    animationStyle: string;
    contentSections: string[];
  };
  businessDetails: {
    goals: string;
    budget: string;
    timeline: string;
    existingWebsite: string;
  };
  contactAndSocial: {
    contactInfo: string;
    socialMedia: string[];
    additionalRequirements: string;
  };
}) => {
  // Normalize array fields to strings for Handlebars
  const normalizedData = {
    ...themeData,
    designPreferences: {
      ...themeData.designPreferences,
      colorScheme: Array.isArray(themeData.designPreferences.colorScheme)
        ? themeData.designPreferences.colorScheme.join(',')
        : themeData.designPreferences.colorScheme || '',
      fontPairing: Array.isArray(themeData.designPreferences.fontPairing)
        ? themeData.designPreferences.fontPairing.join(',')
        : themeData.designPreferences.fontPairing || '',
      brandColors: Array.isArray(themeData.designPreferences.brandColors)
        ? themeData.designPreferences.brandColors.join(',')
        : themeData.designPreferences.brandColors || '',
    },
    selectedFeatures: Array.isArray(themeData.selectedFeatures)
      ? themeData.selectedFeatures
      : typeof themeData.selectedFeatures === 'string'
        ? [themeData.selectedFeatures]
        : [],
    layoutStructure: {
      ...themeData.layoutStructure,
      contentSections: Array.isArray(themeData.layoutStructure.contentSections)
        ? themeData.layoutStructure.contentSections
        : typeof themeData.layoutStructure.contentSections === 'string'
          ? [themeData.layoutStructure.contentSections]
          : [],
    },
    contactAndSocial: {
      ...themeData.contactAndSocial,
      socialMedia: Array.isArray(themeData.contactAndSocial.socialMedia)
        ? themeData.contactAndSocial.socialMedia
        : typeof themeData.contactAndSocial.socialMedia === 'string'
          ? [themeData.contactAndSocial.socialMedia]
          : [],
    },
  };

  const themeDir = path.join(__dirname, '../../generated-themes', normalizedData.basicInfo.websiteName.replace(/\s+/g, '-') || 'theme');
  await fs.mkdir(themeDir, { recursive: true });

  // Compile templates
  const templateFiles = ['style.css.hbs', 'index.php.hbs', 'functions.php.hbs', 'page.php.hbs'];
  for (const file of templateFiles) {
    const templateContent = await fs.readFile(
      path.join(__dirname, '../templates/theme', file),
      'utf-8'
    );
    const template = handlebars.compile(templateContent);
    const output = template(normalizedData);
    const outputFile = file.replace('.hbs', '');
    await fs.writeFile(path.join(themeDir, outputFile), output);
  }

  // Create zip file
  const zip = new admZip();
  zip.addLocalFolder(themeDir);
  const zipFileName = `${normalizedData.basicInfo.websiteName.replace(/\s+/g, '-') || 'theme'}-${Date.now()}.zip`;
  const zipPath = path.join(__dirname, '../../generated-themes', zipFileName);

  // Ensure the ZIP is written before proceeding
  await new Promise((resolve) => zip.writeZip(zipPath, resolve));

  // Verify ZIP file exists and is not empty
  const stats = await fs.stat(zipPath);
  if (stats.size === 0) {
    throw new Error('Generated ZIP file is empty');
  }

  // Save to database
  const theme = await prisma.theme.create({
    data: {
      websiteName: normalizedData.basicInfo.websiteName || '',
      websiteType: normalizedData.basicInfo.websiteType || '',
      industry: normalizedData.basicInfo.industry || '',
      targetAudience: normalizedData.basicInfo.targetAudience || '',
      businessDescription: normalizedData.basicInfo.businessDescription || '',
      designStyle: normalizedData.designPreferences.designStyle || '',
      colorScheme: normalizedData.designPreferences.colorScheme,
      selectedTheme: normalizedData.designPreferences.selectedTheme,
      fontPairing: normalizedData.designPreferences.fontPairing,
      brandColors: normalizedData.designPreferences.brandColors,
      selectedFeatures: JSON.stringify(normalizedData.selectedFeatures),
      layoutStyle: normalizedData.layoutStructure.layoutStyle || '',
      headerStyle: normalizedData.layoutStructure.headerStyle || '',
      footerStyle: normalizedData.layoutStructure.footerStyle || '',
      animationStyle: normalizedData.layoutStructure.animationStyle || '',
      contentSections: JSON.stringify(normalizedData.layoutStructure.contentSections),
      goals: normalizedData.businessDetails.goals || '',
      budget: normalizedData.businessDetails.budget || '',
      timeline: normalizedData.businessDetails.timeline || '',
      existingWebsite: normalizedData.businessDetails.existingWebsite || '',
      contactInfo: normalizedData.contactAndSocial.contactInfo || '',
      socialMedia: JSON.stringify(normalizedData.contactAndSocial.socialMedia),
      additionalRequirements: normalizedData.contactAndSocial.additionalRequirements || '',
      filePath: zipFileName,
    },
  });

  // Clean up theme directory after ZIP is confirmed
  await fs.rm(themeDir, { recursive: true });

  return theme;
};