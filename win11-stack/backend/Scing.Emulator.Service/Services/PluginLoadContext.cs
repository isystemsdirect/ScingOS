using System.Reflection;
using System.Runtime.Loader;

namespace Scing.Emulator.Service.Services;

internal sealed class PluginLoadContext : AssemblyLoadContext
{
  private readonly AssemblyDependencyResolver _resolver;

  public PluginLoadContext(string entryAssemblyPath)
    : base(isCollectible: true)
  {
    _resolver = new AssemblyDependencyResolver(entryAssemblyPath);
  }

  protected override Assembly? Load(AssemblyName assemblyName)
  {
    var path = _resolver.ResolveAssemblyToPath(assemblyName);
    if (path is null) return null;
    return LoadFromAssemblyPath(path);
  }

  protected override IntPtr LoadUnmanagedDll(string unmanagedDllName)
  {
    var path = _resolver.ResolveUnmanagedDllToPath(unmanagedDllName);
    if (path is null) return IntPtr.Zero;
    return LoadUnmanagedDllFromPath(path);
  }
}
