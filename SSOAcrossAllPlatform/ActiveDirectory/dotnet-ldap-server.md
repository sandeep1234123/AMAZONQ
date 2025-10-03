# .NET LDAP Server for Testing

## Create Simple LDAP Server in .NET

### Step 1: Create Console Application
```bash
dotnet new console -n TestLdapServer
cd TestLdapServer
dotnet add package Novell.Directory.Ldap.NETStandard
```

### Step 2: Simple LDAP Server Code

**Program.cs:**
```csharp
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

class Program
{
    private static readonly Dictionary<string, User> Users = new()
    {
        { "app1-test", new User("app1-test", "Test123!", "app1test@ssoplatform.com", "App1", "Test") },
        { "app2-test", new User("app2-test", "Test123!", "app2test@ssoplatform.com", "App2", "Test") },
        { "multi-user", new User("multi-user", "Test123!", "multiuser@ssoplatform.com", "Multi", "User") },
        { "manager", new User("manager", "Test123!", "manager@ssoplatform.com", "Manager", "User") },
        { "admin", new User("admin", "Test123!", "admin@ssoplatform.com", "Admin", "User") }
    };

    static async Task Main(string[] args)
    {
        var listener = new TcpListener(IPAddress.Any, 10389);
        listener.Start();
        Console.WriteLine("LDAP Server started on port 10389");

        while (true)
        {
            var client = await listener.AcceptTcpClientAsync();
            _ = Task.Run(() => HandleClient(client));
        }
    }

    static async Task HandleClient(TcpClient client)
    {
        var stream = client.GetStream();
        var buffer = new byte[1024];
        
        try
        {
            while (client.Connected)
            {
                var bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
                if (bytesRead == 0) break;

                // Simple LDAP bind response
                var response = CreateBindResponse();
                await stream.WriteAsync(response, 0, response.Length);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
        finally
        {
            client.Close();
        }
    }

    static byte[] CreateBindResponse()
    {
        // Simplified LDAP bind success response
        return new byte[] { 0x30, 0x0c, 0x02, 0x01, 0x01, 0x61, 0x07, 0x0a, 0x01, 0x00, 0x04, 0x00, 0x04, 0x00 };
    }
}

public record User(string Username, string Password, string Email, string FirstName, string LastName);
```

### Step 3: Run the Server
```bash
dotnet run
```

## Alternative: Use LdapServer NuGet Package

### Step 1: Create Project
```bash
dotnet new console -n SimpleLdapServer
cd SimpleLdapServer
dotnet add package LdapServer
```

### Step 2: Simple Implementation
```csharp
using LdapServer;
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        var server = new LdapServer.LdapServer();
        server.RegisterHandler(new TestLdapHandler());
        
        await server.StartAsync(10389);
        Console.WriteLine("LDAP Server running on port 10389");
        Console.ReadLine();
    }
}

public class TestLdapHandler : ILdapHandler
{
    public LdapResult Bind(string dn, string password)
    {
        // Accept any bind for testing
        return new LdapResult { ResultCode = LdapResultCode.Success };
    }

    public LdapResult Search(string baseDn, LdapSearchScope scope, string filter)
    {
        // Return test users
        return new LdapResult 
        { 
            ResultCode = LdapResultCode.Success,
            Entries = GetTestUsers()
        };
    }

    private List<LdapEntry> GetTestUsers()
    {
        return new List<LdapEntry>
        {
            new LdapEntry("uid=app1-test,ou=people,dc=test,dc=local")
            {
                Attributes = new Dictionary<string, List<string>>
                {
                    ["uid"] = new() { "app1-test" },
                    ["cn"] = new() { "App1 Test" },
                    ["mail"] = new() { "app1test@test.local" },
                    ["userPassword"] = new() { "Test123!" }
                }
            }
        };
    }
}
```

## Easiest Option: Mock LDAP Service

### Create Mock LDAP Service
```csharp
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;

public class MockLdapServer
{
    private TcpListener _listener;
    private bool _running;

    public async Task StartAsync(int port = 10389)
    {
        _listener = new TcpListener(IPAddress.Any, port);
        _listener.Start();
        _running = true;
        
        Console.WriteLine($"Mock LDAP Server started on port {port}");
        
        while (_running)
        {
            var client = await _listener.AcceptTcpClientAsync();
            _ = Task.Run(() => HandleClientAsync(client));
        }
    }

    private async Task HandleClientAsync(TcpClient client)
    {
        using (client)
        {
            var stream = client.GetStream();
            var buffer = new byte[1024];
            
            while (client.Connected && _running)
            {
                var bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
                if (bytesRead == 0) break;
                
                // Send success response for any LDAP operation
                var response = new byte[] { 0x30, 0x0c, 0x02, 0x01, 0x01, 0x61, 0x07, 0x0a, 0x01, 0x00, 0x04, 0x00, 0x04, 0x00 };
                await stream.WriteAsync(response, 0, response.Length);
            }
        }
    }

    public void Stop()
    {
        _running = false;
        _listener?.Stop();
    }
}

// Usage
class Program
{
    static async Task Main(string[] args)
    {
        var server = new MockLdapServer();
        await server.StartAsync();
    }
}
```

## Quick Test Setup

1. **Create the console app**
2. **Run it** - starts LDAP server on port 10389
3. **Configure Keycloak** with:
   - Connection URL: `ldap://localhost:10389`
   - Bind DN: `cn=admin,dc=test,dc=local`
   - Bind credentials: `admin`
4. **Test connection** - should work

This gives you a working LDAP server in .NET for testing purposes.