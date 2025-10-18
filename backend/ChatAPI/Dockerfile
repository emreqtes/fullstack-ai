# Use the official .NET 9 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the .NET 9 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["ChatAPI.csproj", "."]
RUN dotnet restore "ChatAPI.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "ChatAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ChatAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ChatAPI.dll"]
