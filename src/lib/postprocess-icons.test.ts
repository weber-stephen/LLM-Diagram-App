/**
 * Test file for post-processing functionality
 * This can be run manually to verify the icon replacement works
 */

import { postprocessDiagramXMLRegex, findCloudServiceMatch, fixFillColors } from './postprocess-icons';

// Test data - a simple DiagramXML with text references to cloud services
const testXML = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" version="24.7.13">
  <diagram name="Test" id="test">
    <mxGraphModel dx="946" dy="513" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="test-1" value="EC2" style="sketch=0;outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=0;shape=rectangle;strokeColor=#000000;fillColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="test-2" value="Lambda" style="sketch=0;outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=0;shape=rectangle;strokeColor=#000000;fillColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="300" y="100" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="test-3" value="S3" style="sketch=0;outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=0;shape=rectangle;strokeColor=#000000;fillColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="500" y="100" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="test-4" value="Cloud Run" style="sketch=0;outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=0;shape=rectangle;strokeColor=#000000;fillColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="100" y="200" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="test-5" value="Functions" style="sketch=0;outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=0;shape=rectangle;strokeColor=#000000;fillColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="300" y="200" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="test-6" value="Cosmos DB" style="sketch=0;outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=0;shape=rectangle;strokeColor=#000000;fillColor=#ffffff;" vertex="1" parent="1">
          <mxGeometry x="500" y="200" width="120" height="60" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// Test data for fill color fix
const testXMLWithBlackFills = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" version="24.7.13">
  <diagram name="Test" id="test">
    <mxGraphModel dx="946" dy="513" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="test-1" value="Test" style="sketch=0;outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=0;shape=rectangle;strokeColor=#000000;fillColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="test-2" value="Test2" style="sketch=0;outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=0;shape=rectangle;strokeColor=#000000;fillColor=none;" vertex="1" parent="1">
          <mxGeometry x="300" y="100" width="120" height="60" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// Test the post-processing function
export function testPostProcessing() {
  console.log('Testing post-processing functionality...');
  
  // Test fill color fix
  console.log('Testing fill color fix:');
  const fixedXML = fixFillColors(testXMLWithBlackFills);
  const hasBlackFills = testXMLWithBlackFills.includes('fillColor=#000000') || testXMLWithBlackFills.includes('fillColor=none');
  const hasWhiteFills = fixedXML.includes('fillColor=#FFFFFF');
  console.log('Original had black/none fills:', hasBlackFills);
  console.log('Fixed has white fills:', hasWhiteFills);
  
  // Test individual service matching
  console.log('\nTesting service matching:');
  console.log('EC2:', findCloudServiceMatch('EC2'));
  console.log('Lambda:', findCloudServiceMatch('Lambda'));
  console.log('S3:', findCloudServiceMatch('S3'));
  console.log('Cloud Run:', findCloudServiceMatch('Cloud Run'));
  console.log('Functions:', findCloudServiceMatch('Functions'));
  console.log('Cosmos DB:', findCloudServiceMatch('Cosmos DB'));
  
  // Test the full post-processing
  console.log('\nTesting full XML post-processing:');
  const processedXML = postprocessDiagramXMLRegex(testXML);
  console.log('Processed XML:', processedXML);
  
  // Check if the icons were replaced
  const hasAwsIcons = processedXML.includes('mxgraph.aws4');
  const hasGcpIcons = processedXML.includes('mxgraph.gcp');
  const hasAzureIcons = processedXML.includes('mxgraph.azure');
  
  console.log('\nResults:');
  console.log('AWS icons found:', hasAwsIcons);
  console.log('GCP icons found:', hasGcpIcons);
  console.log('Azure icons found:', hasAzureIcons);
  
  return {
    processedXML,
    hasAwsIcons,
    hasGcpIcons,
    hasAzureIcons,
    fixedXML,
    hasBlackFills,
    hasWhiteFills
  };
}

// Export for manual testing
if (typeof window !== 'undefined') {
  const win = window as typeof window & { testPostProcessing?: () => void };
  win.testPostProcessing = testPostProcessing;
} 