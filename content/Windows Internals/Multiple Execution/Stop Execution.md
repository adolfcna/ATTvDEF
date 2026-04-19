
> [!hint] Multiple Payload Stop Running if Exist
>```cpp
>HANDLE hSync;
>#define SYNCER "Global\\SyncMe"
>#define PIPENAME "\\\\.\\pipe\\SyncMe"
>#define MUTEX 1
>#define EVENT 2
>#define SEMAPH 3
>#define PIPE 4
>
>BOOL IsPayloadRunning(int method) {
>
>	BOOL ret = FALSE;
>	
>	// use global mutant
>	if (method == MUTEX) {
>		hSync = CreateMutex(NULL, FALSE, SYNCER);
>
>		if (GetLastError() == ERROR_ALREADY_EXISTS) {
>			CloseHandle(hSync);
>			ret = TRUE;
>		}
>	}
>	// use global Event
>	else if (method == EVENT) {
>		hSync = CreateEvent(NULL, TRUE, FALSE, SYNCER); 
>
>		if (GetLastError() == ERROR_ALREADY_EXISTS) {
>			CloseHandle(hSync);
>			ret = TRUE;
>		}
>	}
>	// use global Semaphore
>	else if (method == SEMAPH) {
>		hSync = CreateSemaphore(NULL, 0, 100, SYNCER);
>
>		if (GetLastError() == ERROR_ALREADY_EXISTS) {
>			CloseHandle(hSync);
>			ret = TRUE;
>		}
>	}
>	// use named Pipe
>	else if (method == PIPE) {
>		hSync = CreateNamedPipe(PIPENAME, PIPE_ACCESS_DUPLEX, PIPE_TYPE_MESSAGE, PIPE_UNLIMITED_INSTANCES, 1024, 1024, 0, NULL); 
>
>		if (GetLastError() == ERROR_ALREADY_EXISTS) {
>			CloseHandle(hSync);
>			ret = TRUE;
>		}
>	}	
>	
>	return ret;
>}
>
>//int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
>int main(void) {
>
>   
>	// Check if the payload is already running on the machine
>	if (IsPayloadRunning(MUTEX)) {
>		printf("We're already alive!\n");
>		return 0;
>	}
>
>return 0;
>}
>```


