import fs from 'node:fs';
import path from 'node:path';

const root = '/home/vuhongquang/workspace/FinSight';
const batchPath = path.join(root, '.understand-anything/intermediate/batches.json');
const extractPath = path.join(root, '.understand-anything/tmp/ua-file-extract-results-5.json');
const outDir = path.join(root, '.understand-anything/intermediate');

const batches = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
const batch = batches.batches.find((b) => b.batchIndex === 5);
const extraction = JSON.parse(fs.readFileSync(extractPath, 'utf8'));

const fileSummaries = {
  'MarketIngestionApplication.java': ['Spring Boot entry point that starts the market-ingestion service and enables application configuration binding.', ['entry-point', 'spring-boot', 'configuration']],
  'AppConf.java': ['Defines strongly typed application settings for Kafka, Redis, and cluster identity, and logs the resolved runtime configuration at startup.', ['configuration', 'spring-boot', 'runtime-settings']],
  'IngestionController.java': ['Exposes REST endpoints for uploading stock-year Excel data and confirming staged uploads through the ingestion service.', ['api-handler', 'rest-controller', 'upload']],
  'RedisDao.java': ['Wraps Redis hash operations with JSON serialization for saving, loading, and deleting staged ingestion data.', ['data-access', 'redis', 'serialization']],
  'ResponseDto.java': ['Generic response envelope used for Kafka request-response payloads and ingestion service responses.', ['data-model', 'dto', 'serialization']],
  'StockYearDataHistoryRequestDto.java': ['Request DTO carrying stock identifier and year values for validation-history lookups.', ['data-model', 'dto', 'validation']],
  'StockYearDataHistoryResponseDto.java': ['Response DTO that returns historical stock-year records grouped by stock and year.', ['data-model', 'dto', 'validation']],
  'UploadValidationResponse.java': ['Builds standardized upload-validation responses for failed, pending-confirmation, successful, and confirmed ingestion states.', ['data-model', 'dto', 'factory']],
  'RedisEnum.java': ['Defines Redis key namespaces used by the ingestion workflow.', ['constant', 'redis', 'configuration']],
  'KafkaRequestResponseService.java': ['Implements Kafka request-response coordination for validation-history queries using correlation IDs and a reply topic.', ['service', 'kafka', 'request-response']],
  'KafkaService.java': ['Manages Kafka producer and consumer lifecycle, topic creation, message publishing, JSON conversion, and asynchronous consumption.', ['service', 'kafka', 'messaging']],
  'Message.java': ['Kafka message envelope carrying source, event, URI, timestamp, and payload metadata.', ['data-model', 'messaging', 'serialization']],
  'StockYearData.java': ['Financial data model for annual stock metrics, valuation fields, cash-flow values, and ratio calculations.', ['data-model', 'finance', 'valuation']],
  'KafkaProducer.java': ['Higher-level producer facade that initializes Kafka publishing and sends ingestion messages with service URI metadata.', ['service', 'kafka', 'producer']],
  'StagedUpload.java': ['Record that stores staged upload metadata, original filename, parsed records, and validation result before confirmation.', ['data-model', 'record', 'upload']],
  'StockYearDataValidationRecord.java': ['Record pairing a parsed stock-year data row with its source sheet and row location for validation reporting.', ['data-model', 'record', 'validation']],
  'UploadValidationIssue.java': ['Record describing a validation issue field and message for upload errors or warnings.', ['data-model', 'record', 'validation']],
  'StockYearDataUploadService.java': ['Coordinates the complete stock-year upload workflow: file checks, workbook parsing, history lookup, validation, Redis staging, and Kafka publishing.', ['service', 'upload', 'validation']],
  'BusinessValidation.java': ['Applies business rules to stock-year records, including required fields, metric ranges, and year-over-year change warnings.', ['validation', 'business-rules', 'finance']],
  'FileValidation.java': ['Validates uploaded files before parsing, including presence, emptiness, and expected Excel MIME type.', ['validation', 'file-upload', 'excel']],
  'StructureValidation.java': ['Validates workbook and sheet structure for stock-year upload files, including required metrics, year headers, and numeric cells.', ['validation', 'excel', 'schema']],
  'UploadValidationResult.java': ['Accumulates upload validation errors and warnings and supports merging results across validation phases.', ['validation', 'result', 'aggregation']]
};

const classSummaries = {
  MarketIngestionApplication: ['Bootstraps the Spring Boot market-ingestion application.', ['entry-point', 'spring-boot', 'application']],
  AppConf: ['Holds Kafka, Redis, URI, and cluster configuration properties for dependency injection.', ['configuration', 'spring-boot', 'properties']],
  IngestionController: ['REST controller that delegates upload and confirmation requests to the stock-year upload service.', ['api-handler', 'rest-controller', 'upload']],
  RedisDao: ['Redis DAO encapsulating hash storage, expiry handling, and ObjectMapper conversion.', ['data-access', 'redis', 'serialization']],
  ResponseDto: ['Generic DTO for success state, error details, and typed response data.', ['data-model', 'dto', 'response']],
  StockYearDataHistoryRequestDto: ['DTO for requesting historical stock-year validation data.', ['data-model', 'dto', 'request']],
  StockYearDataHistoryResponseDto: ['DTO for returning stock-year history records from validation history queries.', ['data-model', 'dto', 'response']],
  UploadValidationResponse: ['Factory-style response DTO for upload validation workflow outcomes.', ['data-model', 'dto', 'factory']],
  KafkaRequestResponseService: ['Kafka service that tracks pending replies and resolves validation-history responses by correlation ID.', ['service', 'kafka', 'request-response']],
  KafkaService: ['Reusable Kafka transport service for producer, consumer, topic, and serialization behavior.', ['service', 'kafka', 'messaging']],
  Message: ['Envelope model for Kafka event metadata and payload content.', ['data-model', 'messaging', 'serialization']],
  StockYearData: ['Annual financial metric model used by upload parsing and validation.', ['data-model', 'finance', 'valuation']],
  KafkaProducer: ['Producer facade that publishes ingestion messages through KafkaService.', ['service', 'kafka', 'producer']],
  StockYearDataUploadService: ['Central service orchestrating stock-year data upload parsing, validation, staging, and publish confirmation.', ['service', 'upload', 'orchestration']],
  BusinessValidation: ['Business validation component for finance metric sanity checks and historical comparisons.', ['validation', 'business-rules', 'finance']],
  FileValidation: ['File-level upload validator for Excel content-type and empty file checks.', ['validation', 'file-upload', 'excel']],
  StructureValidation: ['Workbook structure validator for required sheets, metric rows, year headers, and numeric values.', ['validation', 'excel', 'schema']],
  UploadValidationResult: ['Mutable validation result collector for errors and warnings.', ['validation', 'result', 'aggregation']]
};

const functionSummaries = {
  main: ['Starts the Spring Boot application with the provided command-line arguments.', ['entry-point', 'spring-boot', 'bootstrap']],
  logConfig: ['Logs key application settings after configuration properties are initialized.', ['configuration', 'logging', 'startup']],
  uploadStockData: ['Accepts an uploaded spreadsheet and delegates validation and staging to the upload service.', ['api-handler', 'file-upload', 'validation']],
  confirmUpload: ['Confirms a staged upload and triggers publishing of the parsed records.', ['api-handler', 'upload', 'confirmation']],
  save: ['Serializes an entity and stores it in a Redis hash, optionally applying an expiry duration.', ['data-access', 'redis', 'serialization']],
  find: ['Reads a Redis hash value and deserializes it into the requested Java type.', ['data-access', 'redis', 'deserialization']],
  delete: ['Removes a field from a Redis hash namespace.', ['data-access', 'redis', 'cleanup']],
  failed: ['Creates a failed upload-validation response from a validation result.', ['factory', 'validation', 'response']],
  waitingConfirmation: ['Creates a response indicating an upload is valid enough to stage and awaits confirmation.', ['factory', 'upload', 'response']],
  success: ['Creates a successful upload-validation response.', ['factory', 'upload', 'response']],
  confirmed: ['Creates a response indicating a staged upload was confirmed.', ['factory', 'upload', 'response']],
  init: ['Initializes Kafka producer or request-response infrastructure after dependency injection.', ['lifecycle', 'kafka', 'startup']],
  sendAndWait: ['Publishes a request with a correlation ID and waits for the matching Kafka reply.', ['kafka', 'request-response', 'async']],
  getStockYearDataValidationHistory: ['Requests historical validation records for uploaded stock-year data.', ['kafka', 'validation', 'history']],
  handleIncomingMessage: ['Handles consumed Kafka messages and completes pending responses when a matching correlation ID is found.', ['kafka', 'consumer', 'callback']],
  resolveReplyTopic: ['Builds the reply topic name for the current cluster.', ['kafka', 'topic', 'configuration']],
  connectProducer: ['Creates and configures Kafka producer infrastructure and default topics.', ['kafka', 'producer', 'configuration']],
  createDefaultTopic: ['Creates the default Kafka topic when it does not already exist.', ['kafka', 'topic', 'setup']],
  send: ['Publishes a Kafka message payload to the configured or specified topic.', ['kafka', 'producer', 'messaging']],
  startConsumer: ['Starts an asynchronous Kafka consumer loop for configured topics.', ['kafka', 'consumer', 'async']],
  subscribe: ['Subscribes the running Kafka consumer to an additional topic.', ['kafka', 'consumer', 'subscription']],
  shutdown: ['Stops Kafka consumer and producer resources and joins the consumer thread.', ['kafka', 'lifecycle', 'cleanup']],
  toJson: ['Serializes Kafka message content with URI and source metadata.', ['serialization', 'kafka', 'messaging']],
  publish: ['Publishes stock-year ingestion messages through KafkaService.', ['kafka', 'producer', 'messaging']],
  parseStockData: ['Parses workbook or sheet contents into stock-year validation records.', ['excel', 'parsing', 'upload']],
  fetchHistoryRecords: ['Fetches historical stock-year records and merges lookup failures into the validation result.', ['validation', 'history', 'kafka']],
  buildHistoryRequests: ['Builds unique stock-year history lookup requests from parsed upload records.', ['validation', 'history', 'mapping']],
  stageUpload: ['Stores parsed upload data and validation result in Redis with a generated upload ID.', ['upload', 'redis', 'staging']],
  publishRecords: ['Publishes confirmed upload records to Kafka for downstream ingestion.', ['upload', 'kafka', 'publishing']],
  setMetricValue: ['Maps spreadsheet metric names to StockYearData financial fields.', ['excel', 'mapping', 'finance']],
  getCellBigDecimalValue: ['Converts spreadsheet cells into BigDecimal values when possible.', ['excel', 'parsing', 'numeric']],
  getCellNumericValue: ['Extracts numeric values from numeric or formula spreadsheet cells.', ['excel', 'parsing', 'numeric']],
  validate: ['Runs validation rules for the file, workbook, or business data represented by the method parameters.', ['validation', 'rules', 'workflow']],
  buildHistoryMap: ['Indexes historical stock-year responses by stock and year for efficient comparisons.', ['validation', 'history', 'mapping']],
  field: ['Formats a validation field path for a record and metric name.', ['validation', 'formatting', 'utility']],
  validateRequiredFields: ['Adds validation errors for missing required stock-year fields.', ['validation', 'required-fields', 'finance']],
  validateMetricRange: ['Checks finance metrics against accepted business ranges.', ['validation', 'business-rules', 'finance']],
  validateYoY: ['Compares uploaded records with historical data and flags large year-over-year changes.', ['validation', 'history', 'finance']],
  warnLargeYoYChange: ['Adds a warning when a metric changes beyond the configured year-over-year threshold.', ['validation', 'warning', 'finance']],
  validateWorkbook: ['Checks workbook-level structure before sheet parsing proceeds.', ['validation', 'excel', 'workbook']],
  validateSheet: ['Validates sheet layout, required metric rows, year headers, and numeric cells.', ['validation', 'excel', 'schema']],
  readYear: ['Parses a year header from a spreadsheet cell.', ['excel', 'parsing', 'date']],
  isNumericLike: ['Determines whether a spreadsheet cell can be treated as numeric input.', ['excel', 'validation', 'numeric']],
  addError: ['Adds a validation error issue to the result.', ['validation', 'error', 'aggregation']],
  addWarning: ['Adds a validation warning issue to the result.', ['validation', 'warning', 'aggregation']],
  merge: ['Combines another validation result into this result.', ['validation', 'aggregation', 'merge']],
  hasErrors: ['Reports whether validation errors have been collected.', ['validation', 'query', 'result']],
  hasWarnings: ['Reports whether validation warnings have been collected.', ['validation', 'query', 'result']],
  getErrors: ['Returns collected validation errors.', ['validation', 'result', 'accessor']],
  getWarnings: ['Returns collected validation warnings.', ['validation', 'result', 'accessor']]
};

function basename(p) {
  return p.split('/').at(-1);
}

function complexity(nonEmpty, metrics = {}) {
  const definitions = (metrics.functionCount || 0) + (metrics.classCount || 0);
  if (nonEmpty > 200 || definitions > 10) return 'complex';
  if (nonEmpty >= 50 || definitions > 3) return 'moderate';
  return 'simple';
}

function node(id, type, name, filePath, summary, tags, cx, lineRange) {
  const n = { id, type, name };
  if (filePath) n.filePath = filePath;
  if (lineRange) n.lineRange = lineRange;
  n.summary = summary;
  n.tags = tags;
  n.complexity = cx;
  return n;
}

const nodes = [];
const edges = [];
const nodeIds = new Set();
const addNode = (n) => {
  if (nodeIds.has(n.id)) return false;
  nodeIds.add(n.id);
  nodes.push(n);
  return true;
};
const addEdge = (source, target, type, weight) => {
  if (source !== target) edges.push({ source, target, type, direction: 'forward', weight });
};

const results = new Map(extraction.results.map((r) => [r.path, r]));
const exportByFile = new Map(extraction.results.map((r) => [r.path, new Set((r.exports || []).map((e) => e.name))]));

for (const file of batch.files) {
  const r = results.get(file.path);
  const name = basename(file.path);
  const [summary, tags] = fileSummaries[name] || [`Analyzes ${name} as part of the market-ingestion service.`, ['code', 'service', 'market-ingestion']];
  addNode(node(`file:${file.path}`, 'file', name, file.path, summary, tags, complexity(r?.nonEmptyLines ?? file.sizeLines, r?.metrics), undefined));

  for (const target of batch.batchImportData[file.path] || []) {
    addEdge(`file:${file.path}`, `file:${target}`, 'imports', 0.7);
  }

  for (const cls of r?.classes || []) {
    const exported = exportByFile.get(file.path)?.has(cls.name);
    if (!exported && cls.methods.length < 2 && (cls.endLine - cls.startLine + 1) < 20) continue;
    const [classSummary, classTags] = classSummaries[cls.name] || [`Represents ${cls.name} in the market-ingestion service.`, ['class', 'java', 'service']];
    const id = `class:${file.path}:${cls.name}`;
    if (addNode(node(id, 'class', cls.name, undefined, classSummary, classTags, complexity(cls.endLine - cls.startLine + 1, { functionCount: cls.methods.length, classCount: 1 }), [cls.startLine, cls.endLine]))) {
      addEdge(`file:${file.path}`, id, 'contains', 1.0);
      if (exported) addEdge(`file:${file.path}`, id, 'exports', 0.8);
    }
  }

  const seenFunctions = new Set();
  for (const fn of r?.functions || []) {
    if (seenFunctions.has(fn.name)) continue;
    seenFunctions.add(fn.name);
    const sameNameClass = (r.classes || []).some((cls) => cls.name === fn.name);
    if (sameNameClass) continue;
    const exported = exportByFile.get(file.path)?.has(fn.name);
    const length = fn.endLine - fn.startLine + 1;
    if (!exported && length < 10) continue;
    const [fnSummary, fnTags] = functionSummaries[fn.name] || [`Implements ${fn.name} behavior for the market-ingestion workflow.`, ['function', 'java', 'workflow']];
    const id = `function:${file.path}:${fn.name}`;
    if (addNode(node(id, 'function', fn.name, undefined, fnSummary, fnTags, complexity(length, { functionCount: 1 }), [fn.startLine, fn.endLine]))) {
      addEdge(`file:${file.path}`, id, 'contains', 1.0);
      if (exported) addEdge(`file:${file.path}`, id, 'exports', 0.8);
    }
  }
}

const importEdgeCount = edges.filter((e) => e.type === 'imports').length;
const expectedImportEdges = Object.values(batch.batchImportData).reduce((sum, arr) => sum + arr.length, 0);
if (importEdgeCount !== expectedImportEdges) {
  throw new Error(`Import edge count mismatch: expected ${expectedImportEdges}, got ${importEdgeCount}`);
}

const filesSorted = [...batch.files].sort((a, b) => a.path.localeCompare(b.path));
const partCount = Math.ceil(Math.max(nodes.length / 60, edges.length / 120));
const nodeFilePath = (n) => n.filePath || n.id.split(':')[1];

for (const old of fs.readdirSync(outDir)) {
  if (/^batch-5(?:-part-\d+)?\.json$/.test(old)) fs.rmSync(path.join(outDir, old));
}

const written = [];
if (partCount <= 1) {
  const outPath = path.join(outDir, 'batch-5.json');
  fs.writeFileSync(outPath, JSON.stringify({ nodes, edges }, null, 2) + '\n');
  written.push(outPath);
} else {
  const chunkSize = Math.ceil(filesSorted.length / partCount);
  for (let i = 0; i < partCount; i++) {
    const partFiles = new Set(filesSorted.slice(i * chunkSize, (i + 1) * chunkSize).map((f) => f.path));
    const partNodes = nodes.filter((n) => partFiles.has(nodeFilePath(n)));
    const partNodeIds = new Set(partNodes.map((n) => n.id));
    const partEdges = edges.filter((e) => partNodeIds.has(e.source));
    const outPath = path.join(outDir, `batch-5-part-${i + 1}.json`);
    fs.writeFileSync(outPath, JSON.stringify({ nodes: partNodes, edges: partEdges }, null, 2) + '\n');
    written.push(outPath);
  }
}

console.log(JSON.stringify({ written, nodes: nodes.length, edges: edges.length, importEdgeCount, expectedImportEdges, filesSkipped: extraction.filesSkipped }, null, 2));
