//
//  RPCModule.m
//  Zingo!
//
//  Created by Aditya Kulkarni on 5/18/20.
//

#import <Foundation/Foundation.h>
#import "RPCModule.h"
#import <React/RCTLog.h>
#import "rust.h"

@implementation RPCModule

// To make it accessible in React
RCT_EXPORT_MODULE();

// Test if wallet exists
RCT_REMAP_METHOD(walletExists,
                 walletExistsWithResolver:(RCTPromiseResolveBlock)resolve
                 walletExistsWithRejecter:(RCTPromiseRejectBlock)reject) {
  // RCTLogInfo(@"walletExists called");

  NSArray *paths = NSSearchPathForDirectoriesInDomains
      (NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];

  // Write to user's documents app directory
  NSString *fileName = [NSString stringWithFormat:@"%@/wallet.dat.txt",
                                                documentsDirectory];
  BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:fileName];
  // RCTLogInfo(@"Wallet exists: %d", (int)fileExists);

  if (fileExists) {
    resolve(@"true");
  } else {
    resolve(@"false");
  }
}

RCT_REMAP_METHOD(walletBackupExists,
                 walletBackupExistsWithResolver:(RCTPromiseResolveBlock)resolve
                 walletBackupExistsWithRejecter:(RCTPromiseRejectBlock)reject) {
  // RCTLogInfo(@"walletExists backup called");

  NSArray *paths = NSSearchPathForDirectoriesInDomains
      (NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];

  // Write to user's documents app directory
  NSString *fileName = [NSString stringWithFormat:@"%@/wallet.backup.dat.txt",
                                                documentsDirectory];
  BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:fileName];
  // RCTLogInfo(@"Wallet backup exists: %d", (int)fileExists);

  if (fileExists) {
    resolve(@"true");
  } else {
    resolve(@"false");
  }
}

// Save the base64 encoded wallet data
-(void) saveWalletFile:(NSString *)data {
  NSArray *paths = NSSearchPathForDirectoriesInDomains
      (NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];

  // Write to user's documents app directory
  NSString *fileName = [NSString stringWithFormat:@"%@/wallet.dat.txt",
                                                documentsDirectory];
  [data writeToFile:fileName atomically:YES encoding:NSUTF8StringEncoding error:nil];

  // RCTLogInfo(@"Saved file");
}

-(void) saveWalletBackupFile:(NSString *)data {
  NSArray *paths = NSSearchPathForDirectoriesInDomains
      (NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];

  // Write to user's documents app directory
  NSString *fileName = [NSString stringWithFormat:@"%@/wallet.backup.dat.txt",
                                                documentsDirectory];
  [data writeToFile:fileName atomically:YES encoding:NSUTF8StringEncoding error:nil];

  // RCTLogInfo(@"Saved backup file");
}

-(void) saveBackgroundFile:(NSString *)data {
  NSArray *paths = NSSearchPathForDirectoriesInDomains
      (NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];

  // Write to user's documents app directory
  NSString *fileName = [NSString stringWithFormat:@"%@/background.json",
                                                documentsDirectory];
  [data writeToFile:fileName atomically:YES encoding:NSUTF8StringEncoding error:nil];

  // RCTLogInfo(@"Saved file");
}

// Read base64 encoded wallet data to a NSString, which is auto translated into a React String when returned
-(NSString *) readWallet {
  NSArray *paths = NSSearchPathForDirectoriesInDomains
                  (NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];

  //make a file name to write the data to using the documents directory:
  NSString *fileName = [NSString stringWithFormat:@"%@/wallet.dat.txt",
                                                documentsDirectory];
  NSString *content = [[NSString alloc] initWithContentsOfFile:fileName
                                                usedEncoding:nil
                                                       error:nil];

  // RCTLogInfo(@"Read file");
  return content;
}

-(NSString *) readWalletBackup {
  NSArray *paths = NSSearchPathForDirectoriesInDomains
                  (NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];

  //make a file name to write the data to using the documents directory:
  NSString *fileName = [NSString stringWithFormat:@"%@/wallet.backup.dat.txt",
                                                documentsDirectory];
  NSString *content = [[NSString alloc] initWithContentsOfFile:fileName
                                                usedEncoding:nil
                                                       error:nil];

  // RCTLogInfo(@"Read file");
  return content;
}

-(BOOL) deleteExistingWallet {
  // RCTLogInfo(@"deleteExistingWallet called");
  NSArray *paths = NSSearchPathForDirectoriesInDomains
                  (NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];

  //make a file name to write the data to using the documents directory:
  NSString *fileName = [NSString stringWithFormat:@"%@/wallet.dat.txt",
                                                documentsDirectory];
  // Delete the file
  [[NSFileManager defaultManager] removeItemAtPath:fileName error:nil];

  return true;
}

// Delete an existing wallet file
RCT_REMAP_METHOD(deleteExistingWallet,
                 deleteExistingWalletWithResolver:(RCTPromiseResolveBlock)resolve
                 deleteExistingWalletWithRejecter:(RCTPromiseRejectBlock)reject) {
  [self deleteExistingWallet];

  resolve(@"true");
}

RCT_REMAP_METHOD(deleteExistingWalletBackup,
                 deleteExistingWalletBackupWithResolver:(RCTPromiseResolveBlock)resolve
                 deleteExistingWalletBackupWithRejecter:(RCTPromiseRejectBlock)reject) {
  // RCTLogInfo(@"deleteExistingWallet backup called");
  NSArray *paths = NSSearchPathForDirectoriesInDomains
                  (NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];

  //make a file name to write the data to using the documents directory:
  NSString *fileName = [NSString stringWithFormat:@"%@/wallet.backup.dat.txt",
                                                documentsDirectory];
  // Delete the file
  [[NSFileManager defaultManager] removeItemAtPath:fileName error:nil];

  resolve(@"true");
}

// (Non react) Save the current wallet to disk
-(void) saveWalletInternal {
  // Then save the file
  char *walletDat = save();
  NSString* walletDataStr = [NSString stringWithUTF8String:walletDat];
  rust_free(walletDat);

  [self saveWalletFile:walletDataStr];
}

-(void) saveWalletBackupInternal {
  // Then save the file
  //char *walletDat = save();
  //NSString* walletDataStr = [NSString stringWithUTF8String:walletDat];
  //rust_free(walletDat);
  NSString* walletDataStr = [self readWallet];

  [self saveWalletBackupFile:walletDataStr];
}

-(NSString*) createNewWallet:(NSString* )server {
  @autoreleasepool {
    // RCTLogInfo(@"createNewWallet called");

    NSString* pathSaplingOutput = [[NSBundle mainBundle]
                      pathForResource:@"saplingoutput" ofType:@""];
    NSData* saplingOutput = [NSData dataWithContentsOfFile:pathSaplingOutput];


    NSString* pathSaplingSpend = [[NSBundle mainBundle]
                      pathForResource:@"saplingspend" ofType:@""];
    NSData* saplingSpend = [NSData dataWithContentsOfFile:pathSaplingSpend];

    NSArray *paths = NSSearchPathForDirectoriesInDomains
                    (NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];

    char* seed = init_new([server UTF8String], [[saplingOutput base64EncodedStringWithOptions:0] UTF8String], [[saplingSpend base64EncodedStringWithOptions:0] UTF8String], [documentsDirectory UTF8String]);
    NSString* seedStr = [NSString stringWithUTF8String:seed];
    rust_free(seed);

    // RCTLogInfo(@"Got seed: %@", seedStr);

    if (![seedStr hasPrefix:@"Error"]) {
      // Also save the wallet after restore
      [self saveWalletInternal];
    }

    return seedStr;
  }
}

// Create a new wallet, automatically saving it.
RCT_REMAP_METHOD(createNewWallet,
                 server:(NSString*)server
                 createNewWalletWithResolver:(RCTPromiseResolveBlock)resolve
                 rejected:(RCTPromiseRejectBlock)reject) {
  @autoreleasepool {
    NSString* seedStr = [self createNewWallet:server];

    resolve(seedStr);
  }
}

// restore a wallet from a given seed and birthday. This also saves the wallet
RCT_REMAP_METHOD(restoreWallet,
                 restoreSeed:(NSString*)restoreSeed
                 birthday:(NSString*)birthday
                 server:(NSString*)server
                 restoreWalletWithResolver:(RCTPromiseResolveBlock)resolve
                 restoreWalletWithRejecter:(RCTPromiseRejectBlock)reject) {
  @autoreleasepool {
    // RCTLogInfo(@"restoreWallet called with %@ %@", restoreSeed, birthday);

    NSString* pathSaplingOutput = [[NSBundle mainBundle]
                      pathForResource:@"saplingoutput" ofType:@""];
    NSData* saplingOutput = [NSData dataWithContentsOfFile:pathSaplingOutput];


    NSString* pathSaplingSpend = [[NSBundle mainBundle]
                      pathForResource:@"saplingspend" ofType:@""];
    NSData* saplingSpend = [NSData dataWithContentsOfFile:pathSaplingSpend];

    NSArray *paths = NSSearchPathForDirectoriesInDomains
                    (NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];

    char* seed = initfromseed([server UTF8String], [restoreSeed UTF8String], [birthday UTF8String], [[saplingOutput base64EncodedStringWithOptions:0] UTF8String], [[saplingSpend base64EncodedStringWithOptions:0] UTF8String], [documentsDirectory UTF8String]);
    NSString* seedStr = [NSString stringWithUTF8String:seed];
    rust_free(seed);

    // RCTLogInfo(@"Seed: %@", seedStr);

    if (![seedStr hasPrefix:@"Error"]) {
      // Also save the wallet after restore
      [self saveWalletInternal];
    }

    resolve(seedStr);
  }
}

-(NSString*) loadExistingWallet:(NSString*)server {
  @autoreleasepool {
    // RCTLogInfo(@"loadExistingWallet called");
    NSString* walletDataStr = [self readWallet];

    NSString* pathSaplingOutput = [[NSBundle mainBundle]
                      pathForResource:@"saplingoutput" ofType:@""];
    NSData* saplingOutput = [NSData dataWithContentsOfFile:pathSaplingOutput];

    NSString* pathSaplingSpend = [[NSBundle mainBundle]
                      pathForResource:@"saplingspend" ofType:@""];
    NSData* saplingSpend = [NSData dataWithContentsOfFile:pathSaplingSpend];

    NSArray *paths = NSSearchPathForDirectoriesInDomains
                    (NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    char* seed = initfromb64([server UTF8String], [walletDataStr UTF8String], [[saplingOutput base64EncodedStringWithOptions:0] UTF8String], [[saplingSpend base64EncodedStringWithOptions:0] UTF8String], [documentsDirectory UTF8String]);
    NSString* seedStr = [NSString stringWithUTF8String:seed];
    rust_free(seed);

    // RCTLogInfo(@"Seed: %@", seedStr);

    return seedStr;
  }
}

// Load an existing wallet from the user's app documents
RCT_REMAP_METHOD(loadExistingWallet,
                 server:(NSString*)server
                 loadExistingWalletWithResolver:(RCTPromiseResolveBlock)resolve
                 loadExistingWalletWithRejecter:(RCTPromiseRejectBlock)reject) {
  @autoreleasepool {
    NSString *seedStr = [self loadExistingWallet:server];

    resolve(seedStr);
  }
}

RCT_REMAP_METHOD(restoreExistingWalletBackup,
                 restoreExistingWalletBackupWithResolver:(RCTPromiseResolveBlock)resolve
                 restoreExistingWalletBackupWithRejecter:(RCTPromiseRejectBlock)reject) {
  @autoreleasepool {
    // RCTLogInfo(@"rstoreExistingWallet backup called");
    NSString* backupDataStr = [self readWalletBackup];

    NSString* walletDataStr = [self readWallet];

    [self saveWalletFile:backupDataStr];

    [self saveWalletBackupFile:walletDataStr];

    resolve(@"true");
  }
}

RCT_REMAP_METHOD(doSave,
                 doSaveWithResolver:(RCTPromiseResolveBlock)resolve
                 doSaveWithRejecter:(RCTPromiseRejectBlock)reject) {
  [self saveWalletInternal];

  resolve(@"true");
}

RCT_REMAP_METHOD(doSaveBackup,
                 doSaveBackupWithResolver:(RCTPromiseResolveBlock)resolve
                 doSaveBackupWithRejecter:(RCTPromiseRejectBlock)reject) {
  [self saveWalletBackupInternal];

  resolve(@"true");
}

// Send a Tx. React needs to construct the sendJSON and pass it in as a string
RCT_REMAP_METHOD(doSend,
                 args:(NSString *)args
                 doSendWithResolver:(RCTPromiseResolveBlock)resolve
                 doSendWithRejecter:(RCTPromiseRejectBlock)reject) {
  // RCTLogInfo(@"doSend called with %@", args);

  NSDictionary* dict = [NSDictionary dictionaryWithObjectsAndKeys:@"send", @"method", args, @"args", resolve, @"resolve", nil];

  [NSThread detachNewThreadSelector:@selector(doExecuteOnThread:) toTarget:self withObject:dict];
}

-(void) doExecuteOnThread:(NSDictionary *)dict {
  @autoreleasepool {
    NSString* method = dict[@"method"];
    NSString* args = dict[@"args"];
    RCTPromiseResolveBlock resolve = dict[@"resolve"];

    // RCTLogInfo(@"execute called with %@", method);

    char *resp = execute([method UTF8String], [args UTF8String]);
    NSString* respStr = [NSString stringWithUTF8String:resp];
    rust_free(resp);

    // RCTLogInfo(@"Got resp for execute (%@): %@", method, respStr);

    if ([method isEqual:@"sync"] && ![respStr hasPrefix:@"Error"]) {
      // Also save the wallet after sync
      [self saveWalletInternal];
    }

    resolve(respStr);
  }
}

// Generic Execute the command.
RCT_REMAP_METHOD(execute,
                 method:(NSString *)method
                 args:(NSString *)args
                 executeWithResolver:(RCTPromiseResolveBlock)resolve
                 executeWithRejecter:(RCTPromiseRejectBlock)reject) {

  NSDictionary* dict = [NSDictionary dictionaryWithObjectsAndKeys:method, @"method", args, @"args", resolve, @"resolve", nil];

  [NSThread detachNewThreadSelector:@selector(doExecuteOnThread:) toTarget:self withObject:dict];
}

// initialize light client
RCT_REMAP_METHOD(initLightClient,
                 server:(NSString*)server
                 initLightClientWithResolver:(RCTPromiseResolveBlock)resolve
                 rejected:(RCTPromiseRejectBlock)reject) {

  NSDictionary* dict = [NSDictionary dictionaryWithObjectsAndKeys:server, @"server", resolve, @"resolve", nil];

  [NSThread detachNewThreadSelector:@selector(initLightClient:) toTarget:self withObject:dict];
}

-(void) initLightClient:(NSDictionary *)dict {
  @autoreleasepool {
    NSString* server = dict[@"server"];
    RCTPromiseResolveBlock resolve = dict[@"resolve"];
    
    NSString* pathSaplingOutput = [[NSBundle mainBundle]
                      pathForResource:@"saplingoutput" ofType:@""];
    NSData* saplingOutput = [NSData dataWithContentsOfFile:pathSaplingOutput];


    NSString* pathSaplingSpend = [[NSBundle mainBundle]
                      pathForResource:@"saplingspend" ofType:@""];
    NSData* saplingSpend = [NSData dataWithContentsOfFile:pathSaplingSpend];

    NSArray *paths = NSSearchPathForDirectoriesInDomains
                    (NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];

    char* resp = init_light_client([server UTF8String], [[saplingOutput base64EncodedStringWithOptions:0] UTF8String], [[saplingSpend base64EncodedStringWithOptions:0] UTF8String], [documentsDirectory UTF8String]);
    NSString* respStr = [NSString stringWithUTF8String:resp];
    rust_free(resp);

    resolve(respStr);
  }
}

/*
// run syncing background task for testing in UI
RCT_REMAP_METHOD(runBackgroundTask,
                 runBackgroundTaskWithResolver:(RCTPromiseResolveBlock)resolve
                 rejected:(RCTPromiseRejectBlock)reject) {

  NSDictionary* dict = [NSDictionary dictionaryWithObjectsAndKeys:resolve, @"resolve", nil];

  [NSThread detachNewThreadSelector:@selector(runBackgroundTask:) toTarget:self withObject:dict];
}
 
-(void) runBackgroundTask:(NSDictionary *)dict {
  RCTPromiseResolveBlock resolve = dict[@"resolve"];
  AppDelegate *appdelegate = [AppDelegate new];

  [NSThread detachNewThreadSelector:@selector(syncingProcessBackgroundTask:) toTarget:appdelegate withObject:nil];
  [NSThread sleepForTimeInterval: 2.000];
  [NSThread detachNewThreadSelector:@selector(syncingStatusProcessBackgroundTask:) toTarget:appdelegate withObject:nil];

  NSString* resp = @"OK";
  
  resolve(resp);
}
*/
@end
