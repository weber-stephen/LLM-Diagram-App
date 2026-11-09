/**
 * Post-processing utility to replace cloud service text references with proper icons
 * in generated DiagramXML content.
 */

export interface CloudServiceMapping {
  icon: string;
  label: string;
  provider: 'aws' | 'gcp' | 'azure';
  style?: string;
}

// AWS4 to AWS3 icon mapping for better compatibility
const AWS4_TO_AWS3_MAPPINGS: Record<string, string> = {
  'mxgraph.aws4.database.rds': 'mxgraph.aws3.rds',
  'mxgraph.aws4.lambda': 'mxgraph.aws3.lambda',
  'mxgraph.aws4.compute': 'mxgraph.aws3.ec2',
  'mxgraph.aws4.storage.s3': 'mxgraph.aws3.s3',
  'mxgraph.aws4.database.dynamodb': 'mxgraph.aws3.dynamo_db',
  'mxgraph.aws4.network.api_gateway': 'mxgraph.aws3.api_gateway',
  'mxgraph.aws4.network.cloudfront': 'mxgraph.aws3.cloudfront',
  'mxgraph.aws4.network.route_53': 'mxgraph.aws3.route_53',
  'mxgraph.aws4.network.vpc': 'mxgraph.aws3.vpc',
  'mxgraph.aws4.network.load_balancer': 'mxgraph.aws3.elastic_load_balancing',
  'mxgraph.aws4.compute.elastic_beanstalk': 'mxgraph.aws3.elastic_beanstalk',
  'mxgraph.aws4.compute.ecs': 'mxgraph.aws3.ec2_container_service',
  'mxgraph.aws4.compute.eks': 'mxgraph.aws3.ec2_container_service',
  'mxgraph.aws4.management.cloudwatch': 'mxgraph.aws3.cloudwatch',
  'mxgraph.aws4.security.iam': 'mxgraph.aws3.iam',
  'mxgraph.aws4.security.cognito': 'mxgraph.aws3.cognito',
  'mxgraph.aws4.messaging.sns': 'mxgraph.aws3.sns',
  'mxgraph.aws4.messaging.sqs': 'mxgraph.aws3.sqs',
  'mxgraph.aws4.database.elasticache': 'mxgraph.aws3.elasticache',
  'mxgraph.aws4.database.redshift': 'mxgraph.aws3.redshift',
};

// Comprehensive mapping of cloud services to their icon representations
const CLOUD_SERVICE_MAPPINGS: Record<string, CloudServiceMapping> = {
  // AWS Services
  'ec2': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.ec2', label: 'EC2', provider: 'aws' },
  'lambda': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.lambda', label: 'Lambda', provider: 'aws' },
  's3': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.s3', label: 'S3', provider: 'aws' },
  'dynamodb': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.dynamodb', label: 'DynamoDB', provider: 'aws' },
  'rds': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.rds', label: 'RDS', provider: 'aws' },
  'aurora': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.aurora', label: 'Aurora', provider: 'aws' },
  'api gateway': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.api_gateway', label: 'API Gateway', provider: 'aws' },
  'cloudfront': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.cloudfront', label: 'CloudFront', provider: 'aws' },
  'route 53': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.route_53', label: 'Route 53', provider: 'aws' },
  'aws vpc': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.vpc', label: 'VPC', provider: 'aws' },
  'aws load balancer': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.application_load_balancer', label: 'Load Balancer', provider: 'aws' },
  'elastic beanstalk': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.elastic_beanstalk', label: 'Elastic Beanstalk', provider: 'aws' },
  'ecs': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.ecs', label: 'ECS', provider: 'aws' },
  'eks': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.eks', label: 'EKS', provider: 'aws' },
  'cloudwatch': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.cloudwatch', label: 'CloudWatch', provider: 'aws' },
  'iam': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.iam', label: 'IAM', provider: 'aws' },
  'cognito': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.cognito', label: 'Cognito', provider: 'aws' },
  'sns': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.sns', label: 'SNS', provider: 'aws' },
  'sqs': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.sqs', label: 'SQS', provider: 'aws' },
  'elasticache': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.elasticache', label: 'ElastiCache', provider: 'aws' },
  'redshift': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.redshift', label: 'Redshift', provider: 'aws' },
  'elasticsearch': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.elasticsearch', label: 'Elasticsearch', provider: 'aws' },
  'opensearch': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.opensearch', label: 'OpenSearch', provider: 'aws' },
  'glue': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.glue', label: 'Glue', provider: 'aws' },
  'athena': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.athena', label: 'Athena', provider: 'aws' },
  'kinesis': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.kinesis', label: 'Kinesis', provider: 'aws' },
  'step functions': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.step_functions', label: 'Step Functions', provider: 'aws' },
  'eventbridge': { icon: 'mxgraph.aws4.productIcon;prIcon=mxgraph.aws4.eventbridge', label: 'EventBridge', provider: 'aws' },

  // GCP Services
  'cloud run': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.cloud_run', label: 'Cloud Run', provider: 'gcp' },
  'compute engine': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.compute_engine', label: 'Compute Engine', provider: 'gcp' },
  'kubernetes engine': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.kubernetes_engine', label: 'Kubernetes Engine', provider: 'gcp' },
  'gke': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.kubernetes_engine', label: 'GKE', provider: 'gcp' },
  'app engine': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.app_engine', label: 'App Engine', provider: 'gcp' },
  'cloud storage': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.cloud_storage', label: 'Cloud Storage', provider: 'gcp' },
  'bigquery': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.bigquery', label: 'BigQuery', provider: 'gcp' },
  'pub/sub': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.pub_sub', label: 'Pub/Sub', provider: 'gcp' },
  'cloud sql': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.cloud_sql', label: 'Cloud SQL', provider: 'gcp' },
  'firestore': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.firestore', label: 'Firestore', provider: 'gcp' },
  'cloud functions': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.cloud_functions', label: 'Cloud Functions', provider: 'gcp' },
  'cloud build': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.cloud_build', label: 'Cloud Build', provider: 'gcp' },
  'cloud monitoring': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.cloud_monitoring', label: 'Cloud Monitoring', provider: 'gcp' },
  'cloud logging': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.cloud_logging', label: 'Cloud Logging', provider: 'gcp' },
  'identity platform': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.identity_platform', label: 'Identity Platform', provider: 'gcp' },
  'gcp load balancing': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.load_balancing', label: 'Load Balancing', provider: 'gcp' },
  'cloud cdn': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.cloud_cdn', label: 'Cloud CDN', provider: 'gcp' },
  'cloud armor': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.cloud_armor', label: 'Cloud Armor', provider: 'gcp' },
  'cloud dns': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.cloud_dns', label: 'Cloud DNS', provider: 'gcp' },
  'gcp vpc': { icon: 'mxgraph.gcp.productIcon;prIcon=mxgraph.gcp.vpc', label: 'VPC', provider: 'gcp' },

  // Azure Services
  'functions': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.functions', label: 'Functions', provider: 'azure' },
  'app service': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.app_service', label: 'App Service', provider: 'azure' },
  'virtual machines': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.virtual_machines', label: 'Virtual Machines', provider: 'azure' },
  'vm': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.virtual_machines', label: 'VM', provider: 'azure' },
  'aks': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.kubernetes_service', label: 'AKS', provider: 'azure' },
  'kubernetes service': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.kubernetes_service', label: 'Kubernetes Service', provider: 'azure' },
  'cosmos db': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.cosmos_db', label: 'Cosmos DB', provider: 'azure' },
  'sql database': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.sql_database', label: 'SQL Database', provider: 'azure' },
  'storage account': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.storage_account', label: 'Storage Account', provider: 'azure' },
  'blob storage': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.blob_storage', label: 'Blob Storage', provider: 'azure' },
  'event hubs': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.event_hubs', label: 'Event Hubs', provider: 'azure' },
  'service bus': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.service_bus', label: 'Service Bus', provider: 'azure' },
  'api management': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.api_management', label: 'API Management', provider: 'azure' },
  'cdn': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.cdn', label: 'CDN', provider: 'azure' },
  'application gateway': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.application_gateway', label: 'Application Gateway', provider: 'azure' },
  'azure load balancer': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.load_balancer', label: 'Load Balancer', provider: 'azure' },
  'virtual network': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.virtual_network', label: 'Virtual Network', provider: 'azure' },
  'azure vnet': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.virtual_network', label: 'VNet', provider: 'azure' },
  'active directory': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.active_directory', label: 'Active Directory', provider: 'azure' },
  'key vault': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.key_vault', label: 'Key Vault', provider: 'azure' },
  'monitor': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.monitor', label: 'Monitor', provider: 'azure' },
  'log analytics': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.log_analytics', label: 'Log Analytics', provider: 'azure' },
  'data factory': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.data_factory', label: 'Data Factory', provider: 'azure' },
  'synapse analytics': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.synapse_analytics', label: 'Synapse Analytics', provider: 'azure' },
  'cognitive services': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.cognitive_services', label: 'Cognitive Services', provider: 'azure' },
  'machine learning': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.machine_learning', label: 'Machine Learning', provider: 'azure' },
  'ml': { icon: 'mxgraph.azure.productIcon;prIcon=mxgraph.azure.machine_learning', label: 'ML', provider: 'azure' },
};

/**
 * Normalize service name for matching
 */
function normalizeServiceName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

/**
 * Find the best matching cloud service for a given text
 */
export function findCloudServiceMatch(text: string): CloudServiceMapping | null {
  const normalizedText = normalizeServiceName(text);
  
  // Direct match
  if (CLOUD_SERVICE_MAPPINGS[normalizedText]) {
    return CLOUD_SERVICE_MAPPINGS[normalizedText];
  }
  
  // Handle generic terms that could match multiple providers
  const genericMappings: Record<string, CloudServiceMapping> = {
    'vpc': CLOUD_SERVICE_MAPPINGS['aws vpc'], // Default to AWS VPC
    'load balancer': CLOUD_SERVICE_MAPPINGS['aws load balancer'], // Default to AWS Load Balancer
    'cdn': CLOUD_SERVICE_MAPPINGS['cloudfront'], // Default to AWS CloudFront
  };
  
  if (genericMappings[normalizedText]) {
    return genericMappings[normalizedText];
  }
  
  // Partial match (check if any service name contains the text)
  for (const [serviceName, mapping] of Object.entries(CLOUD_SERVICE_MAPPINGS)) {
    if (normalizedText.includes(serviceName) || serviceName.includes(normalizedText)) {
      return mapping;
    }
  }
  
  return null;
}

/**
 * Convert AWS4 style shapes to AWS3 style shapes
 * @deprecated This function is not currently used but kept for potential future use
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function convertAWS4ToAWS3(xmlContent: string): string {
  let processedContent = xmlContent;
  
  // Handle both AWS4 resourceIcon pattern and direct shape patterns
  for (const [aws4Shape, aws3Shape] of Object.entries(AWS4_TO_AWS3_MAPPINGS)) {
    // Convert AWS4 resourceIcon pattern
    const resourceIconPattern = new RegExp(
      `shape=mxgraph\\.aws4\\.resourceIcon;resIcon=${aws4Shape.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'g'
    );
    processedContent = processedContent.replace(resourceIconPattern, `shape=${aws3Shape}`);
    
    // Convert direct AWS4 shape pattern
    const directShapePattern = new RegExp(`shape=${aws4Shape.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    processedContent = processedContent.replace(directShapePattern, `shape=${aws3Shape}`);
  }
  
  // Update the style for AWS3 icons to be more compatible
  processedContent = processedContent.replace(
    /style="([^"]*)(shape=mxgraph\.aws3\.[^;"]*)/g,
    (match, beforeShape, shapeAttr) => {
      // Extract existing style properties but replace with AWS3 compatible style
      return `style="outlineConnect=0;dashed=0;verticalLabelPosition=bottom;verticalAlign=top;align=center;html=1;${shapeAttr};fillColor=#2E73B8;gradientColor=none;aspect=fixed"`;
    }
  );
  
  // Also handle cases where AWS3 shapes already exist but need aspect=fixed added
  processedContent = processedContent.replace(
    /style="([^"]*shape=mxgraph\.aws3\.[^"]*)"(?![^>]*aspect=fixed)/g,
    (match, existingStyle) => {
      // Add aspect=fixed if it's missing from existing AWS3 shapes
      return `style="${existingStyle};aspect=fixed"`;
    }
  );
  
  // Fix geometry for AWS3 icons to be more square-like
  // Match any geometry that follows an AWS3 mxCell, even with whitespace/line breaks
  processedContent = processedContent.replace(
    /(<mxCell[^>]*shape=mxgraph\.aws3\.[^>]*>[\s\S]*?<mxGeometry[^>]*width=")(\d+)("[^>]*height=")(\d+)("[^>]*>)/g,
    (match, beforeWidth, currentWidth, betweenDimensions, currentHeight, afterHeight) => {
      // Calculate a reasonable square size based on the smaller dimension to maintain readability
      const width = parseInt(currentWidth);
      const height = parseInt(currentHeight);
      const minDimension = Math.min(width, height);
      
      // Use minimum dimension but ensure it's at least 60 and at most 80 for good visibility
      const squareSize = Math.max(60, Math.min(80, minDimension));
      
      return `${beforeWidth}${squareSize}${betweenDimensions}${squareSize}${afterHeight}`;
    }
  );
  
  return processedContent;
}

/**
 * Replace a generic shape with a cloud service icon
 */
function replaceShapeWithCloudIcon(shapeXml: string, serviceMapping: CloudServiceMapping): string {
  // Create the new shape with cloud service styling
  const newShape = shapeXml
    .replace(/style="[^"]*"/, `style="sketch=0;outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=#ffffff;fillColor=#232F3E;dashed=0;verticalLabelPosition=middle;verticalAlign=bottom;align=center;html=1;whiteSpace=wrap;fontSize=10;fontStyle=1;spacing=3;shape=${serviceMapping.icon};"`)
    .replace(/value="[^"]*"/, `value="${serviceMapping.label}"`);
  
  return newShape;
}

/**
 * Post-process DiagramXML to replace cloud service references with proper icons
 */
export function postprocessDiagramXML(xmlContent: string): string {
  // Fix fill colors (replace black or missing fills with white)
  let processedContent = fixFillColors(xmlContent);
  
  // Ensure all geometry elements are square
  processedContent = ensureSquareGeometry(processedContent);
  
  // Parse the XML to find mxCell elements
  const parser = new DOMParser();
  const doc = parser.parseFromString(processedContent, 'text/xml');
  
  // Find all mxCell elements that might contain cloud service references
  const cells = doc.querySelectorAll('mxCell[value]');
  
  cells.forEach((cell) => {
    const value = cell.getAttribute('value');
    if (!value) return;
    
    // Check if this cell contains a cloud service reference
    const serviceMapping = findCloudServiceMatch(value);
    if (serviceMapping) {
      // Get the current cell XML
      const cellXml = new XMLSerializer().serializeToString(cell);
      
      // Replace with cloud service icon
      const newCellXml = replaceShapeWithCloudIcon(cellXml, serviceMapping);
      
      // Parse the new XML and replace the cell
      const newCellDoc = parser.parseFromString(newCellXml, 'text/xml');
      const newCell = newCellDoc.documentElement;
      
      // Copy all attributes from the new cell to the original
      Array.from(newCell.attributes).forEach(attr => {
        cell.setAttribute(attr.name, attr.value);
      });
    }
  });
  
  // Serialize back to string
  return new XMLSerializer().serializeToString(doc);
}

/**
 * Replace black or missing fills in DiagramXML with white fills
 */
export function fixFillColors(xmlContent: string): string {
  return xmlContent.replace(/fillColor=(#000000|none)/g, 'fillColor=#FFFFFF');
}

/**
 * Ensure all mxGeometry elements have square dimensions (width = height)
 */
export function ensureSquareGeometry(xmlContent: string): string {
  // Match mxGeometry elements with width and height attributes
  const geometryRegex = /<mxGeometry[^>]*width="(\d+)"[^>]*height="(\d+)"[^>]*>/g;
  
  return xmlContent.replace(geometryRegex, (match, width, height) => {
    const widthNum = parseInt(width);
    const heightNum = parseInt(height);
    
    // Use the larger dimension to ensure the shape is readable
    const squareSize = Math.max(widthNum, heightNum);
    
    // Replace both width and height with the square size
    return match
      .replace(/width="\d+"/, `width="${squareSize}"`)
      .replace(/height="\d+"/, `height="${squareSize}"`);
  });
}

/**
 * Alternative implementation using regex for environments without DOM
 */
export function postprocessDiagramXMLRegex(xmlContent: string): string {
  let processedContent = xmlContent;
  
  // Fix fill colors (replace black or missing fills with white)
  processedContent = fixFillColors(processedContent);
  
  // Ensure all geometry elements are square
  processedContent = ensureSquareGeometry(processedContent);
  
  // Find mxCell elements with value attributes
  const cellRegex = /<mxCell[^>]*value="([^"]*)"[^>]*>/g;
  
  processedContent = processedContent.replace(cellRegex, (match, value) => {
    const serviceMapping = findCloudServiceMatch(value);
    if (serviceMapping) {
      // Replace the style and value attributes
      return match
        .replace(/style="[^"]*"/, `style="sketch=0;outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=#ffffff;fillColor=#232F3E;dashed=0;verticalLabelPosition=middle;verticalAlign=bottom;align=center;html=1;whiteSpace=wrap;fontSize=10;fontStyle=1;spacing=3;shape=${serviceMapping.icon};"`)
        .replace(/value="[^"]*"/, `value="${serviceMapping.label}"`);
    }
    return match;
  });
  
  return processedContent;
}

/**
 * Get all available cloud services for debugging or UI display
 */
export function getAvailableCloudServices(): Record<string, CloudServiceMapping> {
  return CLOUD_SERVICE_MAPPINGS;
}

/**
 * Check if a text contains any cloud service references
 */
export function hasCloudServiceReferences(text: string): boolean {
  return findCloudServiceMatch(text) !== null;
} 